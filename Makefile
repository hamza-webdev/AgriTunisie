# Makefile for agritunisie-frontend project structure

PROJECT_DIR := agritunisie-frontend

# Define all directories
DIRS := \
	$(PROJECT_DIR)/public \
	$(PROJECT_DIR)/src \
	$(PROJECT_DIR)/src/assets \
	$(PROJECT_DIR)/src/components \
	$(PROJECT_DIR)/src/components/common \
	$(PROJECT_DIR)/src/components/layout \
	$(PROJECT_DIR)/src/contexts \
	$(PROJECT_DIR)/src/pages \
	$(PROJECT_DIR)/src/pages/parcelles \
	$(PROJECT_DIR)/src/pages/cultures \
	$(PROJECT_DIR)/src/pages/elevage \
	$(PROJECT_DIR)/src/pages/prix \
	$(PROJECT_DIR)/src/pages/meteo \
	$(PROJECT_DIR)/src/pages/communaute \
	$(PROJECT_DIR)/src/pages/gemini \
	$(PROJECT_DIR)/src/services

# Define all files
FILES := \
	$(PROJECT_DIR)/public/index.html \
	$(PROJECT_DIR)/src/assets/logo.svg \
	$(PROJECT_DIR)/src/components/common/Button.js \
	$(PROJECT_DIR)/src/components/common/Card.js \
	$(PROJECT_DIR)/src/components/common/Input.js \
	$(PROJECT_DIR)/src/components/common/Modal.js \
	$(PROJECT_DIR)/src/components/common/Alert.js \
	$(PROJECT_DIR)/src/components/common/LoadingSpinner.js \
	$(PROJECT_DIR)/src/components/layout/Navbar.js \
	$(PROJECT_DIR)/src/components/layout/Footer.js \
	$(PROJECT_DIR)/src/components/layout/MainLayout.js \
	$(PROJECT_DIR)/src/contexts/AuthContext.js \
	$(PROJECT_DIR)/src/pages/HomePage.js \
	$(PROJECT_DIR)/src/pages/LoginPage.js \
	$(PROJECT_DIR)/src/pages/RegisterPage.js \
	$(PROJECT_DIR)/src/pages/DashboardPage.js \
	$(PROJECT_DIR)/src/pages/NotFoundPage.js \
	$(PROJECT_DIR)/src/pages/parcelles/ParcellesListPage.js \
	$(PROJECT_DIR)/src/pages/parcelles/ParcelleFormPage.js \
	$(PROJECT_DIR)/src/pages/parcelles/ParcelleDetailPage.js \
	$(PROJECT_DIR)/src/pages/cultures/CulturesCataloguePage.js \
	$(PROJECT_DIR)/src/pages/elevage/ElevagePage.js \
	$(PROJECT_DIR)/src/pages/prix/PrixPage.js \
	$(PROJECT_DIR)/src/pages/meteo/MeteoPage.js \
	$(PROJECT_DIR)/src/pages/communaute/CommunautePage.js \
	$(PROJECT_DIR)/src/pages/gemini/GeminiPage.js \
	$(PROJECT_DIR)/src/services/apiService.js \
	$(PROJECT_DIR)/src/services/parcelleService.js \
	$(PROJECT_DIR)/src/AppRouter.js \
	$(PROJECT_DIR)/src/AgriApp.js \
	$(PROJECT_DIR)/src/index.js \
	$(PROJECT_DIR)/src/tailwind.css \
	$(PROJECT_DIR)/.env \
	$(PROJECT_DIR)/package.json \
	$(PROJECT_DIR)/tailwind.config.js

# Phony target to ensure this always runs
.PHONY: create_structure clean

# Default target
all: create_structure

# Target to create the directory structure and files
create_structure: $(DIRS) $(FILES)
	@echo "Project structure for $(PROJECT_DIR) created successfully! ✨"

# Rule to create directories
$(DIRS):
	@mkdir -p $@

# Rule to create files
$(FILES):
	@touch $@

# Target to clean the generated structure (optional)
clean:
	@echo "Cleaning up $(PROJECT_DIR)..."
	@rm -rf $(PROJECT_DIR)
	@echo "Cleanup complete! 🗑️"