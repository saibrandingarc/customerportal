<template>
  <div class="main-content">
    <div class="page-content">
      <div class="container-fluid">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">FAQ</h5>
          </div>
          <div class="card-body">
            <div class="faq-layout">
              <nav class="faq-nav" aria-label="FAQ categories">
                <button
                  v-for="category in categories"
                  :key="category.id"
                  type="button"
                  class="faq-nav-item"
                  :class="{ active: category.id === selectedId }"
                  @click="selectedId = category.id"
                >
                  {{ category.title }}
                </button>
              </nav>
              <div v-if="selected" class="faq-content">
                <h6 class="faq-category-title">{{ selected.title }}</h6>
                <div v-for="(item, index) in selected.items" :key="item.question" class="faq-item">
                  <h6 class="faq-question">{{ index + 1 }}. {{ item.question }}</h6>
                  <div class="faq-answer">
                    <p v-for="(paragraph, paragraphIndex) in item.answer" :key="paragraphIndex">
                      {{ paragraph }}
                    </p>
                    <div v-if="item.plans" class="table-responsive">
                      <table class="table table-bordered faq-plans mb-3">
                        <thead>
                          <tr>
                            <th>Plan</th>
                            <th>Yearly Credits</th>
                            <th>Monthly Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="plan in item.plans" :key="plan.name">
                            <td>{{ plan.name }}</td>
                            <td>{{ plan.credits }}</td>
                            <td>{{ plan.cost }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p v-for="(paragraph, paragraphIndex) in item.after ?? []" :key="`after-${paragraphIndex}`">
                      {{ paragraph }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';

interface PlanRow {
  name: string;
  credits: string;
  cost: string;
}

interface FaqItem {
  question: string;
  answer: string[];
  plans?: PlanRow[];
  after?: string[];
}

interface FaqCategory {
  id: string;
  title: string;
  items: FaqItem[];
}

const categories: FaqCategory[] = [
  {
    id: 'plans',
    title: 'Marketing Plans & Credits',
    items: [
      {
        question: 'How does the credit system work?',
        answer: [
          'Branding Arc uses a credit-based system to give you flexibility in how you use your marketing services. Each project has an assigned credit value based on the work involved, and your marketing plan provides an annual allotment of credits that can be used throughout the year. This allows us to adjust your marketing projects as your needs and priorities evolve.',
        ],
      },
      {
        question: 'What are the different marketing plans?',
        answer: [
          'We offer three primary marketing plans designed to accommodate different marketing needs and budgets:',
        ],
        plans: [
          { name: 'Tier 1', credits: '360 credits/year', cost: '$3,000' },
          { name: 'Tier 2', credits: '720 credits/year', cost: '$5,500' },
          { name: 'Tier 3', credits: '1,440 credits/year', cost: '$10,000' },
        ],
        after: [
          'Each tier also includes different levels of strategic support and project revisions. Contact our team to learn more about which plan best fits your goals.',
        ],
      },
      {
        question: "Can I request a project that isn't included in my marketing plan?",
        answer: [
          "Absolutely! Our credit-based system is designed to be flexible. If you have available credits and would like to explore a new project or adjust your planned deliverables, reach out to our team via email to discuss your ideas.",
        ],
      },
      {
        question: 'Can I change my marketing plan?',
        answer: [
          "Of course! If you feel your current plan is limiting your marketing goals, we'd be happy to discuss options for moving to a higher tier with additional credits and services. Simply schedule a meeting with our team to explore your options.",
        ],
      },
    ],
  },
  {
    id: 'requests',
    title: 'Submitting Requests',
    items: [
      {
        question: 'How do I submit website update requests?',
        answer: [
          'You can submit website updates using the New Case button in the top right hand corner of the Case section of your Client Portal.',
          'For small changes, simply describe your request in the case description and attach any necessary images, screenshots, or supporting files.',
          'For larger updates, please make your changes directly in your Website Content Document using redlines and comments. Then, submit a new case letting us know your document has been updated so our team can review and address your requests.',
        ],
      },
      {
        question: 'How do I submit new marketing projects?',
        answer: [
          "Have a new marketing idea or project in mind? We'd love to hear it! Reach out to our team via email to discuss your project and how it fits into your marketing plan.",
        ],
      },
      {
        question: 'What should I include when submitting a new website case request?',
        answer: [
          'The more details you provide, the better! Include a clear description of your request, any relevant website pages or links, and supporting materials such as images, screenshots, or documents. Providing complete information upfront helps our team process your request efficiently and avoid unnecessary delays.',
        ],
      },
    ],
  },
  {
    id: 'approvals',
    title: 'Project Approvals & Management',
    items: [
      {
        question: 'How do I approve a project or request changes?',
        answer: [
          'Open the project awaiting your review in the Deliverables section of the Client Portal by clicking the Content Document.',
          'If everything looks good, select the Approve button to authorize us to move forward. If you\'d like changes, select Provide Feedback and include your requested revisions in the content document so our team can make the necessary updates.',
        ],
      },
      {
        question: 'What happens after I approve a project?',
        answer: [
          'Once you approve a project, our team is authorized to move forward with publishing or distributing the content according to your marketing schedule. No additional approval is required unless our team contacts you about a specific item.',
        ],
      },
      {
        question: 'What happens to unapproved projects?',
        answer: [
          'Projects awaiting approval without any response for 45 days will automatically be marked as "Closed - No Response" in our system. This doesn\'t mean your content will be published or deleted. It simply removes the project from your outstanding approvals and stops further reminders.',
          'Need more time? No problem! Simply contact our team via email to request a hold and let us know when you\'d like to revisit the project. Whether that\'s in a few weeks, next month, or next quarter, we\'ll adjust your project timeline accordingly.',
        ],
      },
    ],
  },
  {
    id: 'portal',
    title: 'Client Portal Access & Support',
    items: [
      {
        question: 'Can I access the Client Portal on my mobile device?',
        answer: [
          "Yes! The Branding Arc Client Portal is accessible through your mobile device's web browser, allowing you to review projects, provide feedback, and manage approvals while on the go.",
        ],
      },
      {
        question: 'How can I get someone else on my team access to the portal?',
        answer: [
          "Your team members can register directly using the Register button on the Client Portal login screen. They'll need to use their current company email address and be listed under your company in our system.",
          'If they encounter any issues registering, simply contact our team via email so we can verify their information and get them set up.',
        ],
      },
      {
        question: "Who should I contact if I have a question that isn't related to a specific project?",
        answer: [
          "We're always happy to help! For general questions about your marketing plan, account, or services, please reach out to katalina@brandingarc.com.",
        ],
      },
    ],
  },
];

const selectedId = ref(categories[0].id);
const selected = computed(() => categories.find((category) => category.id === selectedId.value));
</script>

<style scoped>
.faq-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.faq-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.faq-nav-item {
  padding: 12px 14px;
  border: 1px solid #e9ebec;
  border-radius: 8px;
  background: #f3f6f9;
  color: #212529;
  font-size: 0.95rem;
  font-weight: 600;
  text-align: left;
}

.faq-nav-item.active {
  background: #e8f4fc;
  border-color: #c5e4f6;
  color: #0b5ed7;
}

.faq-category-title {
  margin: 0 0 1rem;
  font-size: 1.05rem;
  font-weight: 700;
}

.faq-item + .faq-item {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e9ebec;
}

.faq-question {
  margin: 0 0 0.5rem;
  font-size: 0.98rem;
  font-weight: 700;
}

.faq-answer p:last-child {
  margin-bottom: 0;
}

.faq-plans th {
  background: #f3f6f9;
  font-size: 0.85rem;
}

@media (max-width: 767.98px) {
  .faq-layout {
    grid-template-columns: 1fr;
  }
}
</style>
