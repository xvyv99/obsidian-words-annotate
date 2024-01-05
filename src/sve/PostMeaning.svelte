<script lang="ts">
	import { Notice } from "obsidian";
	export let Vault;
	export let Path: string; //数据文件的路径
	export let Sel: string; //需要标注的词语

	type WordObject = {
		[key: string] : { [key: string]: string }
	}; //词语存储类型

	let type: string;
	let sense: string;
	//用于绑定的变量，分别代表词性和意思

	let SenseMap: Map<string, string> = new Map(); //key为词语的意思，value为词性
	const TypeArr: string[] = [
		"n.",
		"v.",
		"adj.",
		"adv.",
		"conj.",
		"prep.",
		"pron.",
	];
	//词性列表
	let Data: WordObject; //词语数据
	let WordExist: boolean; //数据文件中是否已存在该词语

	const { adapter } = Vault; //读写接口

	$: SenseMap = SenseMap; //将SenseMap动态绑定

	init(); //初始化

	async function init() {
		Data = JSON.parse(await adapter.read(Path));
		WordExist = Sel in Data
		if (WordExist) {
			SenseMap = new Map(Object.entries(Data[Sel]));
		} //若数据存在则转换为Map并载入
	}

	function addSense() {
		if (!sense) {
			new Notice("Invalid sense!");
			//检查是否有输入
		} else if (SenseMap.has(sense) && SenseMap.get(sense) == type) {
			new Notice("The sense has been entered!");
			//检查输入是否存在
		} else {
			SenseMap = SenseMap.set(sense, type);
		}
	}

	function delSense(key: string) {
		SenseMap.delete(key);
		SenseMap = SenseMap;
	}

	function Submit() {
		if (SenseMap.size == 0) {
			new Notice("Invalid submit!");
			//未提交词语的意思
		} else {
			const SenseJsonObject: { [key: string]: string } = {};

			SenseMap.forEach((value: string, key: string) => {
				SenseJsonObject[key] = value;
			});
			//Map转换为Javascript对象
			Data[Sel] = SenseJsonObject
			console.log(Data)

			adapter.write(Path, JSON.stringify(Data));
			new Notice("Submit successfully!");
		}
	}
</script>

<h2>The Meaning of the Word "<span class="highlight">{Sel}</span>"</h2>

<div class="control">
	&nbsp;
	<label for="choice">Part of Speech</label>
	&nbsp;
	<select id="choice" bind:value={type}>
		{#each TypeArr as t}
			<option value={t}>{t}</option>
		{/each}
	</select>
	<!--词性选择-->
	&nbsp;
	<label for="LineEdit">Sense</label>
	&nbsp;
	<input id="LineEdit" type="text" placeholder="Sense" bind:value={sense} />
	<!--词的意思输入-->
	<button style="float:right" on:click={addSense}>Add sense</button>
</div>
<button style="float:right" on:click={Submit}>Submit</button>
<br />
<hr />

<ul>
	{#each SenseMap as [key, value], i}
		<li>
			Sense{i + 1}
			{value}
			{key}
			<!-- svelte-ignore a11y-invalid-attribute -->
			<a href="#" style="float:right" on:click={() => delSense(key)}
				>Delete</a
			>
		</li>
	{/each}
</ul>

<style>
	.control {
		margin-bottom: 20px; /* 控制控件之间的垂直间距 */
		padding: 10px; /* 添加内边距 */
		border: 1px solid purple; /* 添加边框 */
	}
	.highlight {
		/* 词语强调 */
		color: rgb(213, 65, 213);
	}
</style>
