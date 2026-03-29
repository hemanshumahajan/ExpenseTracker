FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["backend/Expense Tracker/Expense Tracker.csproj", "./backend/"]
RUN dotnet restore "./backend/Expense Tracker/Expense Tracker.csproj"
COPY backend/. ./backend/
WORKDIR /src/backend
RUN dotnet publish "Expense Tracker.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Expense Tracker.dll"]