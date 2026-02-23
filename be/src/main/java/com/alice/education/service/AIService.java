package com.alice.education.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.alice.education.dto.QuestionRequest;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AIService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Generate questions from plain text prompt only.
     */
    public List<QuestionRequest> generateQuestionsFromText(String prompt, int numQuestions) {
        String fullPrompt = buildPrompt(prompt, numQuestions);
        return callGeminiAndParse(fullPrompt, numQuestions);
    }

    /**
     * Generate questions from a PDF file + optional extra prompt.
     */
    public List<QuestionRequest> generateQuestionsFromPdf(MultipartFile pdfFile, String prompt, int numQuestions)
            throws IOException {
        String pdfText = extractTextFromPdf(pdfFile);
        String combinedPrompt = (prompt != null && !prompt.isBlank())
                ? prompt + "\n\nNội dung tài liệu:\n" + pdfText
                : "Nội dung tài liệu:\n" + pdfText;
        String fullPrompt = buildPrompt(combinedPrompt, numQuestions);
        return callGeminiAndParse(fullPrompt, numQuestions);
    }

    // ─── Private helpers ────────────────────────────────────────────────────────

    private String buildPrompt(String userContent, int numQuestions) {
        return """
                Bạn là trợ lý giáo viên chuyên nghiệp. Hãy tạo %d câu hỏi trắc nghiệm dựa trên nội dung sau:

                %s

                Yêu cầu bắt buộc:
                - Mỗi câu hỏi có đúng 4 đáp án A, B, C, D
                - Chỉ có một đáp án đúng
                - Trường "correctAnswer" phải là một trong: "A", "B", "C", "D"
                - Câu hỏi và đáp án bằng tiếng Việt
                - Đáp án đúng phải phân bổ đều (không phải lúc nào cũng là A)

                Trả về ĐÚNG và CHỈ một JSON array theo định dạng sau, không thêm bất kỳ văn bản nào khác:
                [
                  {
                    "content": "...",
                    "optionA": "...",
                    "optionB": "...",
                    "optionC": "...",
                    "optionD": "...",
                    "correctAnswer": "A"
                  }
                ]
                """.formatted(numQuestions, userContent);
    }

    private String extractTextFromPdf(MultipartFile file) throws IOException {
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(doc);
            // Limit PDF text to avoid Gemini token limit
            return text.length() > 8000 ? text.substring(0, 8000) + "\n[...nội dung bị cắt ngắn...]" : text;
        }
    }

    @SuppressWarnings("unchecked")
    private List<QuestionRequest> callGeminiAndParse(String prompt, int numQuestions) {
        try {
            // Build Gemini request body
            Map<String, Object> part = Map.of("text", prompt);
            Map<String, Object> content = Map.of("parts", List.of(part));
            Map<String, Object> genConfig = Map.of("responseMimeType", "application/json");
            Map<String, Object> body = Map.of(
                    "contents", List.of(content),
                    "generationConfig", genConfig
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            String url = apiUrl + "?key=" + apiKey;

            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                throw new RuntimeException("Gemini API trả về lỗi: " + response.getStatusCode());
            }

            // Extract text from response: candidates[0].content.parts[0].text
            JsonNode root = objectMapper.readTree(response.getBody());
            String jsonText = root
                    .path("candidates").get(0)
                    .path("content")
                    .path("parts").get(0)
                    .path("text").asText();

            // Clean up potential markdown code fences
            jsonText = jsonText.trim();
            if (jsonText.startsWith("```")) {
                jsonText = jsonText.replaceAll("```(json)?\\s*", "").replaceAll("```\\s*$", "").trim();
            }

            List<QuestionRequest> questions = objectMapper.readValue(jsonText, new TypeReference<>() {});

            // Validate and set order numbers
            for (int i = 0; i < questions.size(); i++) {
                QuestionRequest q = questions.get(i);
                q.setOrderNumber(i + 1);
                // Ensure correctAnswer is valid
                if (q.getCorrectAnswer() == null ||
                        !q.getCorrectAnswer().matches("^[ABCD]$")) {
                    q.setCorrectAnswer("A");
                }
            }
            return questions;

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi gọi Gemini AI: " + e.getMessage(), e);
        }
    }
}
