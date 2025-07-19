package com.example.copsvrobbers.service;

import com.example.copsvrobbers.repository.GameStatsRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;

class AnalyticsServiceTest {
    @Test
    void testDynamicGoalUsesAverage() {
        GameStatsRepository repo = Mockito.mock(GameStatsRepository.class);
        Mockito.when(repo.findAverageJewelValue()).thenReturn(400.0);
        AnalyticsService service = new AnalyticsService(repo);
        int goal = service.getDynamicRobberGoal();
        assertTrue(goal >= 250 && goal <= 375);
    }
}
