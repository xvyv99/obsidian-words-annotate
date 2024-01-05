<script lang="ts">
	export let Vault;
	export let Path: string; //数据文件的路径
	export let Sel: string; //需要查找的词语

	type WordObject = {
		[key: string] : { [key: string]: string }
	}; //词语存储类型

	let SenseMap: Map<string, string> = new Map();
	let Data: WordObject;
	let WordExist: boolean;
	const { adapter } = Vault; //读写接口

	init();

	$: SenseMap = SenseMap

	async function init() {
		Data = JSON.parse(await adapter.read(Path));
		WordExist = Sel in Data;
		if (WordExist) {
			SenseMap = new Map(Object.entries(Data[Sel]));
		}
	}
</script>

<h2>The Meaning of the Word "<span class="highlight">{Sel}</span>"</h2>

{#if !WordExist}
	Not found.
{:else}
	<ul>
		{#each SenseMap as [key, value], i}
			<li>Sense{i + 1} {value} {key}</li>
		{/each}
	</ul>
{/if}

<style>
	.highlight {
		/* 词语强调 */
		color: rgb(213, 65, 213);
	}
</style>