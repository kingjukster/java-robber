package com.example.copsvrobbers.model;

import jakarta.persistence.*;

@Entity
@Table(name = "JEWEL")
public class Jewel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "JEWEL_ID")
    private Long id;

    @Column(name = "JEWEL_VALUE")
    private Integer jewelValue;

    @Column(name = "X")
    private Integer x;

    @Column(name = "Y")
    private Integer y;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getJewelValue() { return jewelValue; }
    public void setJewelValue(Integer v) { this.jewelValue = v; }
    public Integer getX() { return x; }
    public void setX(Integer x) { this.x = x; }
    public Integer getY() { return y; }
    public void setY(Integer y) { this.y = y; }
}
