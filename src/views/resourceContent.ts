export interface ResourceStep {
  title: string;
  detail: string;
}

export interface ResourceItem {
  slug: string;
  title: string;
  summary?: string;
  url?: string;
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
      {
        slug: 'publish-an-article-on-linkedin',
        title: 'How to Publish an Article on LinkedIn',
        url: 'https://drive.google.com/file/d/1856NT2-6GTY8ONro49055nhoalQqN4Oo/view?usp=sharing',
      },
    ],
  },
  articles: {
    key: 'articles',
    title: 'Articles',
    intro: 'Guides from the Branding Arc blog. Each article opens on brandingarc.com in a new tab.',
    items: [
      {
        slug: 'email-deliverables-process',
        title: 'How Branding Arc Manages Your Email Deliverables',
        url: 'https://brandingarc.com/email-deliverables-process/',
      },
      {
        slug: 'the-power-of-google-reviews',
        title: 'Investing in Google Reviews',
        url: 'https://brandingarc.com/the-power-of-google-reviews/',
      },
      {
        slug: 'how-to-take-a-professional-headshot-with-your-cell-phone',
        title: 'How to Take a Headshot with Your Phone',
        url: 'https://brandingarc.com/how-to-take-a-professional-headshot-with-your-cell-phone/',
      },
      {
        slug: 'getting-the-most-out-of-conferences',
        title: 'Getting the Most Out of Conferences',
        url: 'https://brandingarc.com/getting-the-most-out-of-conferences-according-to-debt-collection-experts/',
      },
      {
        slug: 'how-to-optimize-your-time-at-events',
        title: 'How to Optimize Time at Events',
        url: 'https://brandingarc.com/how-to-optimize-your-time-at-events/',
      },
      {
        slug: 'tips-and-tricks-for-home-office-filming',
        title: 'Tips & Tricks for Filming from Your Office',
        url: 'https://brandingarc.com/tips-and-tricks-for-home-office-filming/',
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
