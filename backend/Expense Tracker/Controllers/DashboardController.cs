using Expense_Tracker.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace Expense_Tracker.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public DashboardController(ApplicationDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<object>> GetDashboardData()
        {
            DateTime startDate = DateTime.Today.AddDays(-6);
            DateTime endDate = DateTime.Today;

            var selectedTransactions = await _context.Transactions
                .Include(t => t.Category)
                .Where(t => t.Date >= startDate && t.Date <= endDate)
                .ToListAsync();

            int totalIncome  = selectedTransactions.Where(t => t.Category!.Type == "Income").Sum(t => t.Amount);
            int totalExpense = selectedTransactions.Where(t => t.Category!.Type == "Expense").Sum(t => t.Amount);
            int balance      = totalIncome - totalExpense;

            CultureInfo culture = CultureInfo.CreateSpecificCulture("en-US");
            culture.NumberFormat.CurrencyNegativePattern = 1;
            string formattedBalance = String.Format(culture, "{0:C0}", balance);

            var doughnutChartData = selectedTransactions
                .Where(t => t.Category!.Type == "Expense")
                .GroupBy(t => t.Category!.CategoryId)
                .Select(g => new
                {
                    categoryTitleWithIcon = g.First().Category!.Icon + " " + g.First().Category!.Title,
                    amount = g.Sum(t => t.Amount),
                    formattedAmount = g.Sum(t => t.Amount).ToString("C0")
                })
                .OrderByDescending(x => x.amount)
                .ToList();

            var incomeSummary = selectedTransactions
                .Where(t => t.Category!.Type == "Income")
                .GroupBy(t => t.Date)
                .Select(g => new SplineChartData { day = g.First().Date.ToString("dd-MMM"), income = g.Sum(t => t.Amount) })
                .ToList();

            var expenseSummary = selectedTransactions
                .Where(t => t.Category!.Type == "Expense")
                .GroupBy(t => t.Date)
                .Select(g => new SplineChartData { day = g.First().Date.ToString("dd-MMM"), expense = g.Sum(t => t.Amount) })
                .ToList();

            string[] last7Days = Enumerable.Range(0, 7)
                .Select(i => startDate.AddDays(i).ToString("dd-MMM"))
                .ToArray();

            var splineChartData = from day in last7Days
                                  join income  in incomeSummary  on day equals income.day  into incomeJoin
                                  from income  in incomeJoin.DefaultIfEmpty()
                                  join expense in expenseSummary on day equals expense.day into expenseJoin
                                  from expense in expenseJoin.DefaultIfEmpty()
                                  select new SplineChartData
                                  {
                                      day     = day,
                                      income  = income  == null ? 0 : income.income,
                                      expense = expense == null ? 0 : expense.expense
                                  };

            var recentTransactions = await _context.Transactions
                .Include(t => t.Category)
                .OrderByDescending(t => t.Date)
                .Take(5)
                .Select(t => new
                {
                    t.TransactionId,
                    t.Amount,
                    t.Note,
                    t.Date,
                    category = t.Category!.Title,
                    icon     = t.Category.Icon,
                    type     = t.Category.Type
                })
                .ToListAsync();

            return Ok(new { totalIncome, totalExpense, balance, formattedBalance, doughnutChartData, splineChartData, recentTransactions });
        }
    }

    public class SplineChartData
    {
        public string day     { get; set; } = "";
        public int    income  { get; set; }
        public int    expense { get; set; }
    }
}