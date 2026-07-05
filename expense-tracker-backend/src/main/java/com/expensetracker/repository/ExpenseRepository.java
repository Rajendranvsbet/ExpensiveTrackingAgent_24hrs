package com.expensetracker.repository;

import com.expensetracker.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserIdOrderByExpenseDateDesc(Long userId);

    List<Expense> findByUserIdAndCategoryOrderByExpenseDateDesc(Long userId, String category);

    List<Expense> findByUserIdAndExpenseDateBetweenOrderByExpenseDateDesc(Long userId, LocalDate startDate, LocalDate endDate);

    List<Expense> findByUserIdAndAmountBetweenOrderByExpenseDateDesc(Long userId, BigDecimal minAmount, BigDecimal maxAmount);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId AND " +
           "(:category IS NULL OR e.category = :category) AND " +
           "(:startDate IS NULL OR e.expenseDate >= :startDate) AND " +
           "(:endDate IS NULL OR e.expenseDate <= :endDate) AND " +
           "(:minAmount IS NULL OR e.amount >= :minAmount) AND " +
           "(:maxAmount IS NULL OR e.amount <= :maxAmount) " +
           "ORDER BY e.expenseDate DESC")
    List<Expense> filterExpenses(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("minAmount") BigDecimal minAmount,
            @Param("maxAmount") BigDecimal maxAmount
    );

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.expenseDate = :date")
    BigDecimal sumTodayExpenses(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal sumExpensesInDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
