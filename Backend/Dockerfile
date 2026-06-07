FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY Backend/BlueBits.Api.csproj .
RUN dotnet restore
COPY Backend/ .
RUN dotnet publish --configuration Release --self-contained false -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
RUN apt-get update && apt-get install -y pandoc curl && rm -rf /var/lib/apt/lists/*
ENV ASPNETCORE_URLS=http://+:8080
ENV DOTNET_gcServer=0
ENV DOTNET_GCConserveMemory=1
ENV ASPNETCORE_ENVIRONMENT=Docker
RUN mkdir -p /app/Resources/PandocTemplates /app/uploads /app/App_Data /app/data
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "BlueBits.Api.dll"]
