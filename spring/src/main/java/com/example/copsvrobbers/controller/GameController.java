package com.example.copsvrobbers.controller;

import com.example.copsvrobbers.dto.GameDto;
import com.example.copsvrobbers.dto.MoveDto;
import com.example.copsvrobbers.service.AnalyticsService;
import com.example.copsvrobbers.service.GameLogicService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class GameController {

    private final GameLogicService logicService;
    private final AnalyticsService analyticsService;

    public GameController(GameLogicService logicService, AnalyticsService analyticsService) {
        this.logicService = logicService;
        this.analyticsService = analyticsService;
    }

    @GetMapping("/start-game")
    public GameDto startGame() {
        logicService.startGame();
        return new GameDto("Game started with goal " + analyticsService.getDynamicRobberGoal());
    }

    @PostMapping("/move")
    public GameDto move(@RequestBody MoveDto move) {
        logicService.playTurn();
        return new GameDto("Moved to " + move.getX() + "," + move.getY());
    }
}
