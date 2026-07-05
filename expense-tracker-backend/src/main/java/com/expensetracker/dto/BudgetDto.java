package com.expensetracker.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetDto {

    private Long id;

    @NotNull(message = "Monthly budget amount is required")
    @DecimalMin(value = "0.01", message = "Monthly budget must be greater than 0")
    private BigDecimal monthlyBudget;

    private BigDecimal spentAmount;

    private BigDecimal remainingAmount;

    @NotBlank(message = "Month name is required")
    private String month;

    @NotNull(message = "Year is required")
    @Min(value = 2020, message = "Year must be 2020 or later")
    private Integer year;

    private Long userId;
}
