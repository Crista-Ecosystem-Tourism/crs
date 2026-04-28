FROM otel/opentelemetry-collector-contrib:0.111.0
COPY config.yaml /etc/otel-collector-config.yaml
# Явный ENTRYPOINT: иначе на части окружений (Coolify / старый cached image) CMD
# без бинарника даёт Exited (127).
ENTRYPOINT ["/otelcol-contrib"]
CMD ["--config", "/etc/otel-collector-config.yaml"]
