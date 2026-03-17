import { gql } from "@apollo/client";

export const GET_EVENTS = gql`
  query GetEvents($page: Int, $pageSize: Int, $severity: EventSeverity, $status: EventStatus, $service: String) {
    events(page: $page, pageSize: $pageSize, severity: $severity, status: $status, service: $service) {
      events {
        id title description severity status service environment tags errorCount createdAt updatedAt resolvedAt
      }
      total page pageSize
    }
  }
`;

export const GET_METRIC_SUMMARY = gql`
  query GetMetricSummary {
    metricSummary {
      totalEvents openEvents criticalEvents avgResolutionTimeHours
      uptimePercent requestsPerMinute errorRate mttr
    }
  }
`;

export const GET_ALERTS = gql`
  query GetAlerts($status: AlertStatus) {
    alerts(status: $status) {
      id name condition threshold status service triggeredAt resolvedAt createdAt
    }
  }
`;

export const GET_SERVICE_HEALTH = gql`
  query GetServiceHealth {
    serviceHealth {
      service status uptime errorRate latencyMs lastChecked
    }
  }
`;

export const CREATE_EVENT = gql`
  mutation CreateEvent($title: String!, $description: String, $severity: EventSeverity!, $service: String!, $environment: String!, $tags: [String!]) {
    createEvent(title: $title, description: $description, severity: $severity, service: $service, environment: $environment, tags: $tags) {
      id title severity status service createdAt
    }
  }
`;

export const UPDATE_EVENT_STATUS = gql`
  mutation UpdateEventStatus($id: ID!, $status: EventStatus!) {
    updateEventStatus(id: $id, status: $status) {
      id status updatedAt resolvedAt
    }
  }
`;

export const RESOLVE_ALERT = gql`
  mutation ResolveAlert($id: ID!) {
    resolveAlert(id: $id) {
      id status resolvedAt
    }
  }
`;
