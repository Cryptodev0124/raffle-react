export function shorten(str: string) {
    if (str.length < 10) return str;
    return `${str.slice(0, 8)}...${str.slice(str.length - 6)}`;
  }