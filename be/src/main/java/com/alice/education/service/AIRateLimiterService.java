package com.alice.education.service;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AIRateLimiterService {

    @Value("${ai.rate-limit.per-minute:5}")
    private int maxPerMinute;

    @Value("${ai.rate-limit.per-day:20}")
    private int maxPerDay;

    private static final long MINUTE_MS = 60_000L;
    private static final long DAY_MS    = 86_400_000L;

    private final Map<String, Deque<Long>> minuteWindows = new ConcurrentHashMap<>();
    private final Map<String, Deque<Long>> dayWindows    = new ConcurrentHashMap<>();

    public record RateLimitResult(
            boolean allowed,
            String  reason,
            long    retryAfterSeconds,
            int     minuteUsed,
            int     dayUsed
    ) {}

    public RateLimitResult checkAndRecord(String username) {
        long now = Instant.now().toEpochMilli();

        Deque<Long> minuteQ = minuteWindows.computeIfAbsent(username, k -> new ArrayDeque<>());
        Deque<Long> dayQ    = dayWindows   .computeIfAbsent(username, k -> new ArrayDeque<>());

        synchronized (minuteQ) {
            synchronized (dayQ) {
                evictBefore(minuteQ, now - MINUTE_MS);
                evictBefore(dayQ,    now - DAY_MS);

                int minuteUsed = minuteQ.size();
                int dayUsed    = dayQ.size();

                if (dayUsed >= maxPerDay) {
                    long retryAfter = retryAfterSeconds(dayQ, now - DAY_MS);
                    return new RateLimitResult(
                            false,
                            String.format(
                                    "Bạn đã dùng hết %d yêu cầu AI cho hôm nay. " +
                                    "Vui lòng thử lại sau %s.",
                                    maxPerDay, formatSeconds(retryAfter)
                            ),
                            retryAfter,
                            minuteUsed,
                            dayUsed
                    );
                }

                if (minuteUsed >= maxPerMinute) {
                    long retryAfter = retryAfterSeconds(minuteQ, now - MINUTE_MS);
                    return new RateLimitResult(
                            false,
                            String.format(
                                    "Quá nhiều yêu cầu AI trong 1 phút (tối đa %d). " +
                                    "Vui lòng thử lại sau %s.",
                                    maxPerMinute, formatSeconds(retryAfter)
                            ),
                            retryAfter,
                            minuteUsed,
                            dayUsed
                    );
                }

                minuteQ.addLast(now);
                dayQ.addLast(now);

                return new RateLimitResult(true, null, 0, minuteUsed + 1, dayUsed + 1);
            }
        }
    }

    public RateLimitResult status(String username) {
        long now = Instant.now().toEpochMilli();
        Deque<Long> minuteQ = minuteWindows.getOrDefault(username, new ArrayDeque<>());
        Deque<Long> dayQ    = dayWindows   .getOrDefault(username, new ArrayDeque<>());
        synchronized (minuteQ) {
            synchronized (dayQ) {
                evictBefore(minuteQ, now - MINUTE_MS);
                evictBefore(dayQ,    now - DAY_MS);
                return new RateLimitResult(true, null, 0, minuteQ.size(), dayQ.size());
            }
        }
    }

    public int getMaxPerMinute() { return maxPerMinute; }
    public int getMaxPerDay()    { return maxPerDay; }

    private static void evictBefore(Deque<Long> deque, long cutoff) {
        while (!deque.isEmpty() && deque.peekFirst() <= cutoff) {
            deque.pollFirst();
        }
    }

    private static long retryAfterSeconds(Deque<Long> deque, long windowStart) {
        if (deque.isEmpty()) return 0;
        long oldestExpiry = deque.peekFirst() - windowStart;
        return Math.max(1, (oldestExpiry + 999) / 1000); // ceil to seconds
    }

    private static String formatSeconds(long secs) {
        if (secs < 60)  return secs + " giây";
        long m = secs / 60, s = secs % 60;
        return s == 0 ? m + " phút" : m + " phút " + s + " giây";
    }

    @Scheduled(fixedDelay = 1_800_000L)
    public void purgeStaleEntries() {
        long now = Instant.now().toEpochMilli();
        minuteWindows.entrySet().removeIf(e -> {
            synchronized (e.getValue()) {
                evictBefore(e.getValue(), now - MINUTE_MS);
                return e.getValue().isEmpty();
            }
        });
        dayWindows.entrySet().removeIf(e -> {
            synchronized (e.getValue()) {
                evictBefore(e.getValue(), now - DAY_MS);
                return e.getValue().isEmpty();
            }
        });
    }
}
