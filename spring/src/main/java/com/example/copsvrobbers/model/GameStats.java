package com.example.copsvrobbers.model;

import jakarta.persistence.*;

@Entity
@Table(name = "GAMESTATS")
public class GameStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "GAME_ID")
    private Long gameId;

    @Column(name = "TOTAL_TURNS")
    private Integer totalTurns;

    @Column(name = "ROBBER_GOAL")
    private Integer robberGoal;

    @Column(name = "TOTAL_JEWEL_VALUE")
    private Integer totalJewelValue;

    @Column(name = "WINNER")
    private String winner;

    // getters and setters
    public Long getGameId() { return gameId; }
    public void setGameId(Long id) { this.gameId = id; }
    public Integer getTotalTurns() { return totalTurns; }
    public void setTotalTurns(Integer t) { this.totalTurns = t; }
    public Integer getRobberGoal() { return robberGoal; }
    public void setRobberGoal(Integer rg) { this.robberGoal = rg; }
    public Integer getTotalJewelValue() { return totalJewelValue; }
    public void setTotalJewelValue(Integer v) { this.totalJewelValue = v; }
    public String getWinner() { return winner; }
    public void setWinner(String w) { this.winner = w; }
}
