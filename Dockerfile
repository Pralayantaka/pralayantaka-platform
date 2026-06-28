FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app

# Copy csproj and restore as distinct layers
COPY Pralayantaka.CoreApi/*.csproj ./
RUN dotnet restore

# Copy everything else and build
COPY Pralayantaka.CoreApi/. ./
RUN dotnet publish -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-env /app/out .

# Run the app
ENTRYPOINT ["dotnet", "Pralayantaka.CoreApi.dll"]
