package com.expensetracker.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "budgets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "monthly_budget", nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyBudget;

    @Column(name = "spent_amount", precision = 10, scale = 2)
    private BigDecimal spentAmount = BigDecimal.ZERO;

    @Column(name = "remaining_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal remainingAmount;

    @Column(nullable = false, length = 20)
    private String month;

    @Column(nullable = false)
    private Integer year;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
