/**
 * Store interface representing the store details
 */
export interface Store {
  title: string;
  description: string;
  home_url: string;
  language: string;
  gmt_offset: number;
  timezone_string: string;
  store_address: {
    [key: string]: string;
  };
}
