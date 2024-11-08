// src/types/interfaces.ts

export interface User {
    name: string;
    id: string;
    email?: string | null;
  }
  
  export interface Approval {
    delegate: boolean;
    takeover: boolean;
    approve: boolean;
    reject: boolean;
    resubmit: boolean;
  }
  
  export interface ReviewProcess {
    approve: boolean;
    reject: boolean;
    resubmit: boolean;
  }
  
  export interface Deliverable {
    Owner: User;
    SEO_Hashtags: string | null;
    SEO_External_Link_1: string | null;
    SEO_External_Link_2: string | null;
    $field_states: string | null;
    $sharing_permission: string;
    Social_Number_of_Posts: number | null;
    Status_SEO: string | null;
    Admin_Approval: User;
    Website_Content_Status: string | null;
    $process_flow: boolean;
    Sub_Category_Other: string | null;
    Article_Refresh_Status: string | null;
    id: string;
    Tool_Upload_Status: string;
    $approval: Approval;
    Event_Page_Status: string | null;
    Created_Time: string;
    Main_Status: string;
    Status_Website_Refresh: string | null;
    SEO_Keywords_Phrases: string | null;
    SEO_Internal_Link_1: string | null;
    Details: string | null;
    SEO_Internal_Link_2: string | null;
    Credit_Multiplier: number | null;
    YT_RI_RT_Status: string | null;
    Created_By: User;
    Web_Designer: string | null;
    rd_Party_Distribution: string | null;
    Handles_Mentioned: string | null;
    Contact_2: string | null;
    $review_process: ReviewProcess;
    Content_Record_ID: string | null;
    Sub_Category_Graphics: string | null;
    Other_Distribution: string[];
    Short_Description: string;
    Type_Category_SEO: string | null;
    Single_Article_Status: string | null;
    GDocs_Content: string | null;
    Credit_Cost: number;
    Record_Status__s: string;
    $orchestration: boolean;
    Staff_SEO: string;
    Type_Category_Mass_Email: string | null;
    Locked__s: boolean;
    Tag: string[];
    Primary_Distribution: string;
    $pathfinder: boolean;
    Sub_Category_Article: string | null;
    Quarter: string;
    Company: User;
    Email: string | null;
    $currency_symbol: string;
    Graphic_Designer: User;
    Topic_Category: string;
    Education_Level: string | null;
    Name: string;
    Last_Activity_Time: string;
    Quality_Control: User;
    Status_Other: string | null;
    Type_Category_Admin: string | null;
    Unsubscribed_Mode: string | null;
    Type_Category_Printing: string | null;
    $locked_for_me: boolean;
    Priority: string;
    Main_Status1: string;
    GDocs_Outline: string | null;
    $wizard_connection_path: string | null;
    $editable: boolean;
    Staff_Client_Contact: string;
    Sub_Category_Social: string;
    Graphic_Status: string | null;
    Staff_Manager: string;
    Sub_Category_Website: string | null;
    Status_Webinars: string | null;
    Block: string;
    $zia_owner_assignment: string;
    Social_Target_URL: string | null;
    Status_Printing: string | null;
    YT_Client_Video_Status: string | null;
    Type_Category_Advertising: string | null;
    Sub_Category_YouTube1: string | null;
    Modified_By: User;
    $review: string | null;
    Social_Call_to_Action: string | null;
    Article_Refresh_5: string | null;
    Article_Refresh_6: string | null;
    Article_Refresh_3: string | null;
    Article_Refresh_4: string | null;
    Deliverable_Author: string | null;
    Article_Refresh_1: string | null;
    GDrive_Folder: string | null;
    Article_Refresh_2: string | null;
    Date_Published: string | null;
    $zia_visions: string | null;
    Final_Deliverable: string | null;
    Staus_Admin: string | null;
    Stagnant_Timer: string;
    Modified_Time: string;
    Status_Advertising: string | null;
    Due_Date: string;
    Unsubscribed_Time: string | null;
    Social_Media_Status: string;
    Contact: string | null;
    $approval_state: string;
    Email_Status: string | null;
  }
  