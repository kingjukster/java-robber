package com.example.copsvrobbers.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ROBBERSTATS")
public class RobberStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ROBBER_ID")
    private Long robberId;

    @ManyToOne
    @JoinColumn(name = "GAME_ID")
    private GameStats game;

    @Column(name = "JEWELS_STOLEN")
    private Integer jewelsStolen;

    // getters and setters
    public Long getRobberId() { return robberId; }
    public void setRobberId(Long id) { this.robberId = id; }
    public GameStats getGame() { return game; }
    public void setGame(GameStats g) { this.game = g; }
    public Integer getJewelsStolen() { return jewelsStolen; }
    public void setJewelsStolen(Integer v) { this.jewelsStolen = v; }
}
