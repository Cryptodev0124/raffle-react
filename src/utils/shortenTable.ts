export function shortenTable(str: string) {
    if (str.length < 10) return str;
    return `${str.slice(0, 12)}...${str.slice(str.length - 8)}`;
  }