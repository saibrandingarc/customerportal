<template>
    <v-container fluid fill-height>
        <!-- Loading Spinner -->
        <div v-if="loading" class="spinner-overlay">
            <div class="spinner"></div>
        </div>
        <v-row align="center" justify="center">
            <v-col cols="8">
                <v-card>
                    <!-- Logo Section -->
                    <v-card-title class="d-flex justify-center">
                        <img src="@/assets/logo.png" alt="Logo" class="logo1" />
                    </v-card-title>
                    <v-card-title>
                        <h2 class="text-h5 text-center">End User Licence Agreement</h2>
                    </v-card-title>
  
                    <v-card-text>
                        <div class="flex h-full justify-center" style="margin: 0px 36px; padding-top: 83.36px; will-change: auto;">
                            <h1><span>End-User License Agreement (EULA)</span></h1>
                            <p><span>This End-User License Agreement ("Agreement") is a legal agreement between you ("User") and Branding Arc governing the use of the Company’s Customer Portal ("Software"). By accessing or using the Software, you agree to be bound by the terms of this Agreement. If you do not agree, you must not use the Software.</span></p>
                            <div contenteditable="false">
                                <hr>
                            </div>
                            <h2><span>1. License Grant</span></h2>
                            <p><span>The Company grants you a limited, non-exclusive, non-transferable, and revocable license to use the Software solely for your personal or internal business purposes, in accordance with this Agreement.</span></p>
                            <div contenteditable="false">
                                <hr>
                            </div>
                            <h2><span>2. Restrictions</span></h2>
                            <p><span>You agree not to:</span></p>
                            <ul data-spread="false">
                                <li>
                                    <p><span>Copy, modify, distribute, or create derivative works of the Software.</span></p>
                                </li>
                                <li>
                                    <p><span>Reverse engineer, decompile, or disassemble the Software.</span></p>
                                </li>
                                <li>
                                    <p><span>Rent, lease, or sublicense the Software to third parties.</span></p>
                                </li>
                                <li>
                                    <p><span>Use the Software in a manner that violates any applicable laws or regulations.</span></p>
                                </li>
                            </ul>
                            <div contenteditable="false">
                                <hr>
                            </div>
                            <h2><span>3. Ownership</span></h2>
                            <p><span>The Company retains all ownership rights, title, and interest in and to the Software, including any updates, enhancements, or derivative works. This Agreement does not grant you any ownership rights.</span></p>
                            <div contenteditable="false">
                                <hr>
                            </div>
                            <h2><span>4. User Responsibilities</span></h2>
                            <p><span>You agree to:</span></p>
                            <ul data-spread="false">
                                <li>
                                    <p><span>Use the Software only as permitted by this Agreement.</span></p>
                                </li>
                                <li>
                                    <p><span>Ensure the security of your login credentials and notify the Company immediately of any unauthorized access.</span></p>
                                </li>
                                <li>
                                    <p><span>Provide accurate and up-to-date information when using the Software.</span></p>
                                </li>
                            </ul>
                            <div contenteditable="false">
                                <hr>
                            </div>
                            <h2><span>5. Privacy</span></h2>
                            <p><span>Your use of the Software is subject to the Company’s Privacy Policy, which is incorporated by reference into this Agreement. By using the Software, you consent to the collection and use of your information as described in the Privacy Policy.</span></p>
                            <div contenteditable="false">
                                <hr>
                            </div>
                            <h2><span>6. Updates and Support</span></h2>
                            <p><span>The Company may provide updates, upgrades, or fixes to the Software at its discretion. Continued use of the Software after such updates constitutes your acceptance of the updated version. The Company is not obligated to provide support.</span></p>
                            <div contenteditable="false">
                                <hr>
                            </div>
                            <h2><span>7. Termination</span></h2>
                            <p><span>The Company may terminate this Agreement immediately if you breach any of its terms. Upon termination, you must stop using the Software and delete any copies in your possession.</span></p>
                            <div contenteditable="false">
                                <hr>
                            </div>
                            <h2><span>8. Disclaimer of Warranties</span></h2>
                            <p><span>THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</span></p>
                            <div contenteditable="false">
                                <hr>
                            </div>
                            <h2><span>9. Limitation of Liability</span></h2>
                            <p><span>TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE COMPANY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SOFTWARE.</span></p>
                            <div contenteditable="false">
                                <hr>
                            </div>
                            <h2><span>10. Governing Law</span></h2>
                            <p><span>This Agreement shall be governed by and construed in accordance with the laws of US. Any disputes arising under this Agreement shall be subject to the exclusive jurisdiction of the courts in US.</span></p>
                            <div contenteditable="false">
                                <hr>
                            </div>
                            <h2><span>11. Amendments</span></h2>
                            <p><span>The Company reserves the right to modify this Agreement at any time. Continued use of the Software after such modifications constitutes your acceptance of the updated terms.</span></p>
                            <div contenteditable="false">
                                <hr>
                            </div>
                            <h2><span>12. Contact Information</span></h2>
                            <p><span>For questions or concerns about this Agreement, please contact:</span></p>
                            <p><span>Branding Arc</span><br><span>support@brandingarc.com</span><br><span>561-408-0992</span></p>
                            <div contenteditable="false">
                                <hr>
                            </div>
                            <p><span><strong>By using the Software, you acknowledge that you have read, understood, and agreed to be bound by this Agreement.</strong></span></p>
                            <p><br class="ProseMirror-trailingBreak"></p>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>
  
<script lang="ts" setup>
    import authConfig from "../../auth_config.json";
    import router from '@/router';
</script>
  
<style scoped>
    .logo1 {
        width: 100%;  /* Adjust size as needed */
        max-width: 200px; /* Limit max width */
        margin-bottom: 16px; /* Add some space below the logo */
    }
    .error {
        color: red;
        text-align: center;
    }
</style>
  