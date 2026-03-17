const { gql } = require("graphql-tag");

const typeDefs = gql`
  scalar DateTime

  enum EventSeverity { LOW MEDIUM HIGH CRITICAL }
  enum EventStatus { OPEN ACKNOWLEDGED RESOLVED CLOSED }
  enum AlertStatus { ACTIVE RESOLVED SILENCED }

  type Event {
    id: ID!
    title: String!
    description: String
    severity: EventSeverity!
    status: EventStatus!
    service: String!
    environment: String!
    tags: [String!]
    errorCount: Int!
    createdAt: String!
    updatedAt: String!
    resolvedAt: String
  }

  type Alert {
    id: ID!
    name: String!
    condition: String!
    threshold: Float!
    status: AlertStatus!
    service: String!
    triggeredAt: String
    resolvedAt: String
    createdAt: String!
  }

  type MetricSummary {
    totalEvents: Int!
    openEvents: Int!
    criticalEvents: Int!
    avgResolutionTimeHours: Float!
    uptimePercent: Float!
    requestsPerMinute: Float!
    errorRate: Float!
    mttr: Float!
  }

  type ServiceHealth {
    service: String!
    status: String!
    uptime: Float!
    errorRate: Float!
    latencyMs: Float!
    lastChecked: String!
  }

  type PaginatedEvents {
    events: [Event!]!
    total: Int!
    page: Int!
    pageSize: Int!
  }

  type Query {
    events(page: Int, pageSize: Int, severity: EventSeverity, status: EventStatus, service: String): PaginatedEvents!
    event(id: ID!): Event
    alerts(status: AlertStatus): [Alert!]!
    metricSummary: MetricSummary!
    serviceHealth: [ServiceHealth!]!
  }

  type Mutation {
    createEvent(title: String!, description: String, severity: EventSeverity!, service: String!, environment: String!, tags: [String!]): Event!
    updateEventStatus(id: ID!, status: EventStatus!): Event!
    acknowledgeEvent(id: ID!): Event!
    resolveEvent(id: ID!): Event!
    createAlert(name: String!, condition: String!, threshold: Float!, service: String!): Alert!
    resolveAlert(id: ID!): Alert!
  }
`;

module.exports = { typeDefs };
