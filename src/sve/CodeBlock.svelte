<script lang="ts">
	import { Notice } from "obsidian";
	export let Vault;
	export let Path: string; //数据文件的路径
	export let Rows: string[]; //需要标注的词语

	type WordObject = {
		Word: string;
		Meaning: { [key: string]: string };
	}; //词语存储类型

	let Data: WordObject[] = []; //词语数据
    const Command: string[] = ["All-Meaning"]

	const { adapter } = Vault; //读写接口

	init(); //初始化

	async function init() {
		Data = JSON.parse(await adapter.read(Path));
	} //读取文件数据初始化

    function CharChoice(index: number,length: number) {
        if (index == length-1) {
            return "└──"
        } else{
            return "├── "
        }
    }

</script>

<div class="code-block">

{#each Rows as row}
    {#if Command.includes(row)}
        {#each Data as {Word,Meaning}}
            {Word} <br>
            {#each Object.entries(Meaning) as [key,value],i}
                {CharChoice(i,Object.keys(Meaning).length)} {i+1}. {value} {key} <br>
            {/each}
        {/each}
    {:else}
        {row} <br>
    {/if}
{/each}

</div>

<style>
    .code-block {
        background-color: rgb(42, 42, 42);
        padding: 10px;
        font-family: 'Consolas', monospace;
    }
</style>