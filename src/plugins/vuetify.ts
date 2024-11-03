// src/plugins/vuetify.ts
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components'; // Import all components
import * as directives from 'vuetify/directives'; // Import all directives
import '@mdi/font/css/materialdesignicons.css' // Ensure MDI is included


const vuetify = createVuetify({
  components, // Register all Vuetify components
  directives, // Register all Vuetify directives
  icons: {
    defaultSet: 'mdi', // Ensure MDI is set as the default icon set
  },
});

export default vuetify;