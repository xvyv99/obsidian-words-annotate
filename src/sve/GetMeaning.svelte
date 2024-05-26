<script lang="ts">
	import {Notice} from "obsidian";
	export let Vault;
	export let Path: string; //数据文件的路径
	export let Sel: string; //需要查找的词语

	type WordObject = {
		[key: string] : { [key: string]: string }
	}; //词语存储类型

	let Sense: Map<string, string>; //TODO:没办法删掉这行代码.
	let Data: WordObject;
	let WordHit = new Map();
	const { adapter } = Vault; //读写接口

	init();

	$: Sense = Sense //TODO:没办法删掉这行代码.
	$: WordHit = WordHit

	async function init() {
		Data = JSON.parse(await adapter.read(Path));
		Sense = new Map(); //TODO:没办法删掉这行代码.
		for (let key in Data) {
			if (key.toLowerCase() == Sel.toLowerCase()) {
				WordHit.set(key,Object.entries(Data[key]));
			}
		}
	}
</script>

<h2>The Meaning of the Word "<span class="highlight">{Sel}</span>"</h2>

{#if WordHit.size==0}
	Not found.
{:else}
	<ul>
		{#each WordHit.keys() as key,i}
		<li>Hit{i + 1} {key}</li>
			<ul>
				{#each WordHit.get(key) as [meaning, type],j}
				<li>Sense{j + 1} {type} {meaning}</li>
				{/each}
			</ul>
		{/each}
	</ul>
{/if}

<style>
	.highlight {
		/* 词语强调 */
		color: rgb(213, 65, 213);
	}
</style>