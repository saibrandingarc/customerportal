import { createAuth0 } from '@auth0/auth0-vue';
import authConfig from "../../auth_config.json";

export const auth = createAuth0({
    domain: authConfig.domain,
    clientId: authConfig.clientId,
    authorizationParams: {
        redirect_uri: window.location.origin,
    }
});
