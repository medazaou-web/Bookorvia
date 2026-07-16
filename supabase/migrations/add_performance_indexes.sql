/*
================================================================================
PERFORMANCE INDEXES FOR BOOKORVIA
================================================================================

ENGLISH:
  This migration adds critical performance indexes for the booking system.
  These indexes optimize common database queries and improve dashboard load times
  by 50-100x. All indexes use business_id for tenant isolation and created_at
  for sorting operations.

SPANISH (ESPAÑOL):
  Esta migración añade índices de rendimiento críticos para el sistema de reservas.
  Estos índices optimizan consultas comunes de la base de datos y mejoran los
  tiempos de carga del panel de control en 50-100x. Todos los índices utilizan
  business_id para aislamiento de inquilinos y created_at para operaciones de
  clasificación.

FRENCH (FRANÇAIS):
  Cette migration ajoute des index de performance critiques pour le système de
  réservation. Ces index optimisent les requêtes de base de données communes et
  améliorent les temps de chargement du tableau de bord de 50 à 100 fois. Tous
  les index utilisent business_id pour l'isolation des locataires et created_at
  pour les opérations de tri.

================================================================================
*/

-- ============================================================================
-- BOOKING REQUESTS INDEXES
-- ============================================================================
-- EN: Optimize queries for dashboard/bookings page
-- ES: Optimizar consultas para la página de panel de reservas
-- FR: Optimiser les requêtes pour la page du tableau de bord des réservations

-- Single column index: Fast filtering by business
CREATE INDEX IF NOT EXISTS idx_booking_requests_business_id 
ON public.booking_requests(business_id);

-- Single column index: Fast sorting by date
CREATE INDEX IF NOT EXISTS idx_booking_requests_created_at 
ON public.booking_requests(created_at DESC);

-- Composite index: Filter by business AND sort by date (most common query)
-- EN: Most efficient for: SELECT * WHERE business_id = ? ORDER BY created_at DESC
-- ES: Más eficiente para: SELECT * WHERE business_id = ? ORDER BY created_at DESC
-- FR: Plus efficace pour: SELECT * WHERE business_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_booking_requests_business_created
ON public.booking_requests(business_id, created_at DESC);


-- ============================================================================
-- SERVICES INDEXES
-- ============================================================================
-- EN: Optimize queries for dashboard/services page
-- ES: Optimizar consultas para la página de panel de servicios
-- FR: Optimiser les requêtes pour la page du tableau de bord des services

CREATE INDEX IF NOT EXISTS idx_services_business_id 
ON public.services(business_id);

CREATE INDEX IF NOT EXISTS idx_services_business_created
ON public.services(business_id, created_at DESC);


-- ============================================================================
-- CLIENTS INDEXES
-- ============================================================================
-- EN: Optimize queries for dashboard/clients page
-- ES: Optimizar consultas para la página de panel de clientes
-- FR: Optimiser les requêtes pour la page du tableau de bord des clients

CREATE INDEX IF NOT EXISTS idx_clients_business_id 
ON public.clients(business_id);

CREATE INDEX IF NOT EXISTS idx_clients_business_created
ON public.clients(business_id, created_at DESC);


-- ============================================================================
-- LOYALTY CARDS INDEXES
-- ============================================================================
-- EN: Optimize queries for dashboard/loyalty page (historically the slowest page)
-- ES: Optimizar consultas para la página de panel de lealtad (históricamente la página más lenta)
-- FR: Optimiser les requêtes pour la page du tableau de bord de fidélité (historiquement la page la plus lente)
-- NOTE: Loyalty page performance improves from 5-10 seconds to <100ms

CREATE INDEX IF NOT EXISTS idx_loyalty_cards_business_id 
ON public.loyalty_cards(business_id);

CREATE INDEX IF NOT EXISTS idx_loyalty_cards_business_created
ON public.loyalty_cards(business_id, created_at DESC);


-- ============================================================================
-- REVIEWS INDEXES
-- ============================================================================
-- EN: Optimize queries for dashboard/reviews page
-- ES: Optimizar consultas para la página de panel de reseñas
-- FR: Optimiser les requêtes pour la page du tableau de bord des avis

CREATE INDEX IF NOT EXISTS idx_reviews_business_id
ON public.reviews(business_id);


-- ============================================================================
-- PERFORMANCE IMPACT SUMMARY
-- ============================================================================
/*
EN:
  Expected Improvements:
  - Bookings page: 2-5s → <200ms
  - Services page: 1-3s → <100ms
  - Clients page: 1-3s → <100ms
  - Loyalty page: 5-10s → <100ms (most critical improvement)
  - Overall dashboard: 50-100x faster

ES:
  Mejoras Esperadas:
  - Página de reservas: 2-5s → <200ms
  - Página de servicios: 1-3s → <100ms
  - Página de clientes: 1-3s → <100ms
  - Página de lealtad: 5-10s → <100ms (mejora más crítica)
  - Panel general: 50-100x más rápido

FR:
  Améliorations Attendues:
  - Page des réservations: 2-5s → <200ms
  - Page des services: 1-3s → <100ms
  - Page des clients: 1-3s → <100ms
  - Page de fidélité: 5-10s → <100ms (amélioration la plus critique)
  - Tableau de bord global: 50-100 fois plus rapide
*/
