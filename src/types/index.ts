export interface Item {
  id: string;
  name: string;
  column_values: Array<{
    id: string;
    type: string;
    text?: string;
    value?: string;
  }>;
}

export interface ParsedDocColumnValue {
  files?: {
    name: string;
    linkToFile: string;
  }[];
}
