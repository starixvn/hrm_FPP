FROM hub.nexdev.net/base/dotnet/core/sdk:9.0-alpine AS builder

WORKDIR /src
# Copy solution and project files
COPY FPP.Website/*.csproj FPP.Website/
COPY FPP.Core/*.csproj FPP.Core/
COPY FPP.Models/*.csproj FPP.Models/
COPY FPP.Services/*.csproj FPP.Services/
COPY FPP.Resources/*.csproj FPP.Resources/

# Copy the rest of the source code
RUN dotnet nuget add source https://nuget.nexdev.net/api/v2
# Restore dependencies
RUN dotnet restore -v n -r linux-x64 FPP.Website/FPP.Website.csproj

# Copy source codes
COPY FPP.Website/ FPP.Website/
COPY FPP.Core/ FPP.Core/
COPY FPP.Models/ FPP.Models/
COPY FPP.Services/ FPP.Services/
COPY FPP.Resources/ FPP.Resources/

# Publish the application
WORKDIR /src/FPP.Website
RUN dotnet publish -r linux-x64 --self-contained false -c Release -o /app

FROM hub.nexdev.net/base/dotnet/core/aspnet:9.0-alpine AS base

WORKDIR /app
COPY --from=builder /app .


RUN adduser --disabled-password \
    --home /app \
    --gecos '' dotnetuser && chown -R dotnetuser /app && chown -R dotnetuser /tmp
USER dotnetuser

ENTRYPOINT ["dotnet", "FPP.Website.dll"] 
