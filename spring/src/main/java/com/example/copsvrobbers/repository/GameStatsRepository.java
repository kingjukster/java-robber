package com.example.copsvrobbers.repository;

import com.example.copsvrobbers.model.GameStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface GameStatsRepository extends JpaRepository<GameStats, Long> {
    @Query("select avg(g.totalJewelValue) from GameStats g")
    Double findAverageJewelValue();
}
