import {
  App,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  Editor,
  normalizePath,
  Vault,
} from "obsidian";

import PostModal from "./sve/PostMeaning.svelte";
import GetModal from "./sve/GetMeaning.svelte";
import CodeBlock from "./sve/CodeBlock.svelte"

let WordData: { [x: string]: string | DocumentFragment; }; //词语的标注数据
let DataPath: string; //word.json的路径

interface WordsSettings {
  mySetting: string;
}
const DEFAULT_SETTINGS: WordsSettings = {
  mySetting: "default",
};

async function UpdateData(vault:Vault) {
  WordData = JSON.parse(await vault.adapter.read(DataPath));
}

export default class Words extends Plugin {
  settings: WordsSettings | undefined;
  Result: string | undefined;

  async onload() {
    console.log("loading plugin");

    const path = normalizePath(`${this.manifest.dir}/words.json`);
    DataPath = path;
    //数据文件路径处理

    const { adapter } = this.app.vault;
    if (!await adapter.exists(path)) {
      console.log("Fail to found word data.Try to create it.");
      await adapter.write(path, "{}");
    }
    //数据文件存在性判断

    this.registerMarkdownCodeBlockProcessor("words", (source, el, ctx) => {
      const rows = source.split("\n").filter((row) => row.length > 0);
      //将文本分割成行,并去掉空行
      const WordBLock = new CodeBlock({
        target: el,
        props: {
          Vault: this.app.vault,
          Rows: rows,
          Path: DataPath
        }
      });
      
    }); //自定义代码块"words"

    await this.loadSettings();

    this.addCommand({
      id: "annotate-word",
      name: "Annotate word",
      hotkeys: [{ modifiers: [], key: "F4" }],
      editorCallback: (editor: Editor) => {
        const selection = editor.getSelection();
        new PostMeaning(this.app, selection).open();
        editor.replaceSelection(selection);
      },
    }); //词语标注命令"Annotate word"

    this.addCommand({
      id: "find-word",
      name: "Find word",
      hotkeys: [{ modifiers: [], key: "F5" }],
      editorCallback: (editor: Editor) => {
        const selection = editor.getSelection();
        new GetMeaning(this.app, selection).open();
      },
    }); // 词语查询命令"Find word"

    this.registerCodeMirror((cm: CodeMirror.Editor) => {
      console.log("codemirror", cm);
    });
  }

  onunload() {
    console.log("unloading plugin");
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
}
export class PostMeaning extends Modal {
  private Selection: string; //获取要解释的词
  private PostPanel: PostModal | undefined;

  constructor(app: App, sel: string) {
    super(app);
    this.Selection = sel;
  }

  onOpen() { //加载输入界面
    let { vault } = this.app;

    if (this.Selection == "") {
      const { contentEl } = this;
      contentEl.setText("You haven't selected a word yet.")
    }
    else {
      this.PostPanel = new PostModal({
        target: this.contentEl,
        props: {
          Vault: vault,
          Sel: this.Selection,
          Path: DataPath
        }
      });
    }
  }

  onClose() {
    this.PostPanel?.$destroy();
  }
} //词语标注窗口

export class GetMeaning extends Modal {
  private Selection: string; //获取要查询的词
  private GetPanel: GetModal | undefined;

  constructor(app: App, sel: string) {
    super(app);
    this.Selection = sel
  }

  onOpen() { //加载输入界面
    const { vault } = this.app;
    UpdateData(vault);

    if (this.Selection == "") {
      const { contentEl } = this;
      contentEl.setText("You haven't selected a word yet.")
    }
    else {
      let { vault } = this.app;
      this.GetPanel = new GetModal({
        target: this.contentEl,
        props: {
          Vault: vault,
          Sel: this.Selection,
          Path: DataPath
        }
      });
    }
  }


  onClose() {
    let { contentEl } = this;
    contentEl.empty();
    this.GetPanel?.$destroy();
  }
} //词语查询结果窗口