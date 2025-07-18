CREATE TABLE utilisateurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  nom_complet TEXT,
  role TEXT NOT NULL CHECK (role IN ('client', 'coiffeur', 'admin')) DEFAULT 'client',
  url_avatar TEXT,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_mise_a_jour TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lieux (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  adresse TEXT NOT NULL,
  ville TEXT,
  code_postal TEXT,
  pays TEXT,
);

CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  description TEXT,
  prix NUMERIC(10, 2) NOT NULL,
  duree INTEGER NOT NULL, 
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_mise_a_jour TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE rendez_vous (
  id SERIAL PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  coiffeur_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  lieu_id INTEGER NOT NULL REFERENCES lieux(id) ON DELETE CASCADE,
  date_heure TIMESTAMP WITH TIME ZONE NOT NULL,
  statut TEXT NOT NULL CHECK (statut IN ('en_attente', 'confirme', 'annule', 'termine')) DEFAULT 'en_attente',
  notes TEXT,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_mise_a_jour TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE avis (
  id SERIAL PRIMARY KEY,
  utilisateur_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  coiffeur_utilisateur_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  rendez_vous_id INTEGER NOT NULL REFERENCES rendez_vous(id) ON DELETE CASCADE,
  lieu_id INTEGER NOT NULL REFERENCES lieux(id) ON DELETE CASCADE,
  note INTEGER NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire TEXT,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE disponibilites_coiffeurs ( 
  id SERIAL PRIMARY KEY,
  coiffeur_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  jour_semaine INTEGER NOT NULL CHECK (jour_semaine BETWEEN 0 AND 6),
  est_disponible BOOLEAN DEFAULT TRUE,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_mise_a_jour TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_disponibilite UNIQUE (coiffeur_id, jour_semaine)
);