export interface Dialog {
  open: boolean,
  header: string,
  txt: string[],
  confirmFunction?: Function,
}