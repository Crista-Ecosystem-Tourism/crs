# Образ Prometheus с уже встроенным prometheus.yml — для Coolify и других случаев,
# когда bind-mount ./monitoring/prometheus на хост недоступен или приводит к пустому каталогу.
FROM prom/prometheus:latest
COPY prometheus.yml /etc/prometheus/prometheus.yml
