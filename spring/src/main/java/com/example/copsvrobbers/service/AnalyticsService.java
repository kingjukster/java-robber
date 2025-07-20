package com.example.copsvrobbers.service;

import com.example.copsvrobbers.repository.GameStatsRepository;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {

    private final GameStatsRepository repo;

    public AnalyticsService(GameStatsRepository repo) {
        this.repo = repo;
    }

    public int getDynamicRobberGoal() {
        Double avg = repo.findAverageJewelValue();
        if (avg == null) return 340;
        // simplified dynamic goal based on average jewel value
        int goal = (int)(avg * 0.85);
        if (goal < 250) goal = 250;
        if (goal > 375) goal = 375;
        return goal;
    }
}
