package com.alice.education.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.alice.education.dto.DashboardStatsResponse;
import com.alice.education.model.Role;
import com.alice.education.repository.AccountRepository;
import com.alice.education.repository.ClassroomRepository;
import com.alice.education.repository.SubjectRepository;
import com.alice.education.repository.TextbookRepository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import com.alice.education.dto.RecentActivityResponse;

@Service
public class DashboardService {

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private TextbookRepository textbookRepository;

    @Autowired
    private ClassroomRepository classroomRepository;

    @Autowired
    private AccountRepository accountRepository;

    public DashboardStatsResponse getStats() {
        long totalSubjects = subjectRepository.count();
        long totalTextbooks = textbookRepository.count();
        long activeClassrooms = classroomRepository.count();
        long totalStudents = accountRepository.countByRole(Role.CUSTOMER);

        List<RecentActivityResponse> activities = new ArrayList<>();

        // Lấy môn học mới
        subjectRepository.findTop5ByOrderByCreatedAtDesc()
                .forEach(s -> activities.add(new RecentActivityResponse("SUBJECT", "New subject created",
                        s.getName() + " was added", s.getCreatedAt())));

        // Lấy sách giáo khoa mới
        textbookRepository.findTop5ByOrderByCreatedAtDesc().forEach(t -> activities
                .add(new RecentActivityResponse("TEXTBOOK", "New textbook added", t.getTitle(), t.getCreatedAt())));

        // Lấy lớp học mới
        classroomRepository.findTop5ByOrderByCreatedAtDesc().forEach(c -> activities
                .add(new RecentActivityResponse("CLASSROOM", "Classroom created", c.getName(), c.getCreatedAt())));

        // Lấy học sinh mới
        accountRepository.findTop5ByRoleOrderByCreatedAtDesc(Role.CUSTOMER)
                .forEach(a -> activities.add(new RecentActivityResponse("STUDENT", "Students enrolled",
                        a.getFullName() + " joined", a.getCreatedAt())));

        // Sắp xếp theo thời gian giảm dần và lấy 10 mục mới nhất
        List<RecentActivityResponse> recentActivities = activities.stream()
                .sorted(Comparator.comparing(RecentActivityResponse::getTime).reversed())
                .limit(10)
                .collect(Collectors.toList());

        return new DashboardStatsResponse(totalSubjects, totalTextbooks, activeClassrooms, totalStudents,
                recentActivities);
    }
}
