export interface ResourceStep {
  title: string;
  detail: string;
}

export interface ResourceItem {
  slug: string;
  title: string;
  summary: string;
  paragraphs?: string[];
  steps?: ResourceStep[];
}

export interface ResourceLibrary {
  key: 'scribes' | 'articles';
  title: string;
  intro: string;
  items: ResourceItem[];
}

export const resourceLibraries: Record<ResourceLibrary['key'], ResourceLibrary> = {
  scribes: {
    key: 'scribes',
    title: 'Scribes',
    intro: 'Short walkthroughs for the tasks you do most often in the portal.',
    items: [
      {
        slug: 'submit-a-case',
        title: 'Submit a case',
        summary: 'Send a question, a small website update, or a technical issue to the Branding Arc team.',
        steps: [
          {
            title: 'Open Cases',
            detail: 'In the left menu, choose Cases. Open requests are listed on the Open tab.',
          },
          {
            title: 'Start a new case',
            detail: 'Click New Case. Use this for minor updates, technical issues, questions, or general support.',
          },
          {
            title: 'Describe the request',
            detail: 'Write what you need and where it appears on the site. Include the page name or URL when you have it.',
          },
          {
            title: 'Attach files',
            detail: 'Add screenshots, copy, or other files that show the change. A picture of the current page usually speeds up the first reply.',
          },
          {
            title: 'Submit and track it',
            detail: 'Submit the case. It stays on the Open tab until the team resolves it, then it moves to Closed.',
          },
        ],
      },
      {
        slug: 'review-a-deliverable',
        title: 'Review a deliverable',
        summary: 'Find work that is waiting on you and record your approval or feedback.',
        steps: [
          {
            title: 'Open Deliverables',
            detail: 'Choose Deliverables in the left menu. Pending Approvals shows items that need a response.',
          },
          {
            title: 'Open the item',
            detail: 'Select the deliverable you want to review. Check the files, notes, and current status before you respond.',
          },
          {
            title: 'Approve or send feedback',
            detail: 'Approve the work if it is ready. If something needs to change, describe the revision in the item so the team can pick it up.',
          },
          {
            title: 'Confirm the status',
            detail: 'After you respond, the status updates. Completed and canceled items leave the pending list.',
          },
        ],
      },
      {
        slug: 'check-an-invoice',
        title: 'Check an invoice',
        summary: 'See what is outstanding, what is past due, and open the invoice details.',
        steps: [
          {
            title: 'Open Invoices',
            detail: 'Choose Invoices in the left menu, or click Outstanding Balance or Past Due on the dashboard.',
          },
          {
            title: 'Read the totals',
            detail: 'Outstanding Balance is everything still unpaid. Past Due is the portion whose due date has already passed.',
          },
          {
            title: 'Open a row',
            detail: 'Use the invoice list to find the document, amount, and due date you want to review.',
          },
        ],
      },
    ],
  },
  articles: {
    key: 'articles',
    title: 'Articles',
    intro: 'Short guides about how your website project and portal account work.',
    items: [
      {
        slug: 'from-planning-to-launch',
        title: 'From planning to launch',
        summary: 'What each stage of a website build is for, and what you will see on the dashboard.',
        paragraphs: [
          'The dashboard timeline follows the website from the first planning conversation through launch. The current step is the one the team is working in now.',
          'Planning and framework is where the site structure, requirements, and starting materials are confirmed. Content development is the writing and gathering of pages. Design and element building shapes the look and builds the pieces those pages need.',
          'Site configuration connects the build to the tools it will use. Internal review is the team check before you see a round. Client review and approval is your turn to respond. Launch preparation covers the final checks, and launch is when the site goes live or moves into support.',
          'When the website status is Active, the timeline card is replaced by a Live label in the header.',
        ],
      },
      {
        slug: 'cases-and-project-requests',
        title: 'Cases and project requests',
        summary: 'Which requests belong in the portal, and which ones should be emailed as a new project.',
        paragraphs: [
          'A case is the right place for a minor update, a technical issue, a question, or general support. Describe the change, attach any files, and the team tracks it until it is resolved.',
          'A new page, a full content rewrite, or a larger website change is a separate project. Send those by email so they can be scoped instead of being handled as a support case.',
          'If you are unsure, open a case and say what outcome you want. The team will tell you if it needs to move into a project.',
        ],
      },
      {
        slug: 'md-credits',
        title: 'Credits',
        summary: 'Where to see the credits on your account and how they relate to the work in progress.',
        paragraphs: [
          'Credits are shown in the account menu at the top of the portal, with your company name and the products you are engaged in. Open that menu any time you need the current number.',
          'Credits describe the capacity available on the account. Deliverables and cases are the work itself. An open deliverable does not change the credit number until the team updates the account record.',
          'If the number looks wrong, open a case and include the figure you expected. The team can check it against the account.',
        ],
      },
    ],
  },
};

export function libraryFor(key: string | undefined): ResourceLibrary | null {
  if (key === 'scribes' || key === 'articles') {
    return resourceLibraries[key];
  }
  return null;
}
