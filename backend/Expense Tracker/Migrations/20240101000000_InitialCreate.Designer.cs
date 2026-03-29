using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ExpenseTrackerAPI.Data;

#nullable disable

namespace ExpenseTrackerAPI.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20240101000000_InitialCreate")]
    partial class InitialCreate
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
            modelBuilder.HasAnnotation("ProductVersion", "8.0.2");
        }
    }
}