package com.example.copsvrobbers.model;

import jakarta.persistence.*;

@Entity
@Table(name = "POLICESTATS")
public class PoliceStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "POLICE_ID")
    private Long policeId;

    @ManyToOne
    @JoinColumn(name = "GAME_ID")
    private GameStats game;

    @Column(name = "JEWELS_RECOVERED")
    private Integer jewelsRecovered;

    @Column(name = "ARRESTS_MADE")
    private Integer arrestsMade;

    public Long getPoliceId() { return policeId; }
    public void setPoliceId(Long id) { this.policeId = id; }
    public GameStats getGame() { return game; }
    public void setGame(GameStats g) { this.game = g; }
    public Integer getJewelsRecovered() { return jewelsRecovered; }
    public void setJewelsRecovered(Integer v) { this.jewelsRecovered = v; }
    public Integer getArrestsMade() { return arrestsMade; }
    public void setArrestsMade(Integer v) { this.arrestsMade = v; }
}
