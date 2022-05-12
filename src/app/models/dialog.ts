export interface Dialog {
  open: Boolean,
  header: String,
  txt: String[],
  elements: string[],
  closeButtonInner: String,
}

export interface DialogButton { 
  inner: String,
  action: String,
}