# MSK Cluster Configuration
resource "aws_msk_configuration" "kafka_config" {
  kafka_versions = ["3.5.1"]
  name           = "${var.cluster_name}-kafka-config"

  server_properties = <<PROPERTIES
auto.create.topics.enable=true
default.replication.factor=3
min.insync.replicas=2
num.io.threads=8
num.network.threads=5
num.partitions=1
num.replica.fetchers=2
replica.lag.time.max.ms=30000
socket.receive.buffer.bytes=102400
socket.request.max.bytes=104857600
socket.send.buffer.bytes=102400
unclean.leader.election.enable=true
zookeeper.session.timeout.ms=18000
PROPERTIES
}

# MSK Kafka Cluster
resource "aws_msk_cluster" "kafka" {
  cluster_name           = "${var.cluster_name}-kafka"
  kafka_version          = "3.5.1"
  number_of_broker_nodes = 3

  broker_node_group_info {
    instance_type   = var.kafka_instance_type
    client_subnets  = module.vpc.private_subnets
    storage_info {
      ebs_storage_info {
        volume_size = 100
      }
    }
    security_groups = [aws_security_group.kafka_sg.id]
  }

  configuration_info {
    arn      = aws_msk_configuration.kafka_config.arn
    revision = aws_msk_configuration.kafka_config.latest_revision
  }

  encryption_info {
    encryption_at_rest_kms_key_id = aws_kms_key.kafka.arn
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
  }

  logging_info {
    broker_logs {
      cloudwatch_logs {
        enabled   = true
        log_group = aws_cloudwatch_log_group.kafka.name
      }
    }
  }

  tags = {
    Name = "${var.cluster_name}-kafka"
  }
}

# Security Group for Kafka
resource "aws_security_group" "kafka_sg" {
  name_prefix = "${var.cluster_name}-kafka-sg"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 9092
    to_port         = 9092
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }

  ingress {
    from_port       = 9094
    to_port         = 9094
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }

  ingress {
    from_port       = 2181
    to_port         = 2181
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }

  tags = {
    Name = "${var.cluster_name}-kafka-sg"
  }
}

# KMS Key for Kafka encryption
resource "aws_kms_key" "kafka" {
  description = "KMS key for Kafka encryption"
  
  tags = {
    Name = "${var.cluster_name}-kafka-key"
  }
}

resource "aws_kms_alias" "kafka" {
  name          = "alias/${var.cluster_name}-kafka"
  target_key_id = aws_kms_key.kafka.key_id
}

# CloudWatch Log Group for Kafka
resource "aws_cloudwatch_log_group" "kafka" {
  name              = "/aws/msk/${var.cluster_name}"
  retention_in_days = 7
  
  tags = {
    Name = "${var.cluster_name}-kafka-logs"
  }
}
