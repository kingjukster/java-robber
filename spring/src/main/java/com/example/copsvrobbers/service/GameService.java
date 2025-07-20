package com.example.copsvrobbers.service;

import com.example.copsvrobbers.model.GameStats;
import com.example.copsvrobbers.model.PoliceStats;
import com.example.copsvrobbers.model.RobberStats;
import com.example.copsvrobbers.repository.GameStatsRepository;
import com.example.copsvrobbers.repository.PoliceStatsRepository;
import com.example.copsvrobbers.repository.RobberStatsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GameService {

    private final GameStatsRepository gameRepo;
    private final RobberStatsRepository robberRepo;
    private final PoliceStatsRepository policeRepo;

    public GameService(GameStatsRepository gameRepo,
                       RobberStatsRepository robberRepo,
                       PoliceStatsRepository policeRepo) {
        this.gameRepo = gameRepo;
        this.robberRepo = robberRepo;
        this.policeRepo = policeRepo;
    }

    @Transactional
    public GameStats saveGame(GameStats game) {
        return gameRepo.save(game);
    }

    @Transactional
    public void saveRobberStats(RobberStats stats) {
        robberRepo.save(stats);
    }

    @Transactional
    public void savePoliceStats(PoliceStats stats) {
        policeRepo.save(stats);
    }
}
