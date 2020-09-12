<script>
  import { onMount } from "svelte";
  import { kebabToTitleCase, stringifyProperties } from "./lib";

  const jsonUrl = "./build/plugins.json";

  let data = [];
  let selectedClasses = {};

  function updateSelectedElement() {
    chrome?.devtools?.inspectedWindow?.eval("setSelectedElement($0)", {
      useContentScriptContext: true,
    });
  }

  function sendObjectToInspectedPage(message) {
    message.tabId = chrome?.devtools?.inspectedWindow?.tabId;
    chrome?.extension?.sendMessage(message);
  }

  function connectToChrome() {
    chrome?.devtools?.panels?.elements?.onSelectionChanged.addListener(
      updateSelectedElement
    );

    // Create a port with background page for continous message communication
    const port = chrome?.extension?.connect({
      name: "Tailwind CSS",
    });

    // Listen to messages from the background page
    port?.onMessage?.addListener(function (message) {
      if (message.action === "SET_SELECTED_ELEMENT") {
        console.log("message", message.content);
        selectedClasses = message.content.split(" ").reduce((prev, key) => {
          return { ...prev, [key]: true };
        }, {});
      }
    });

    updateSelectedElement();
    sendObjectToInspectedPage({
      action: "script",
      content: "public/content_script.js",
    });
  }

  onMount(async function () {
    const response = await fetch(jsonUrl);
    data = await response.json();
    connectToChrome();
  });

  function handleChange(event, selector) {
    const inspectedEval = chrome?.devtools?.inspectedWindow?.eval;
    if (inspectedEval) {
      if (event.target.checked) {
        inspectedEval(`$0.classList.add('${selector.substr(1)}')`, () => {
          updateSelectedElement();
        });
      } else {
        inspectedEval(`$0.classList.remove('${selector.substr(1)}')`, () => {
          updateSelectedElement();
        });
      }
    } else {
      console.debug("onChange", selector, event.target.checked);
    }
  }

  function transformSelector(selector) {
    return selector.split(/[>:]/)[0].trim();
  }
</script>

<main class="w-full mx-auto px-6">
  {#each data as item}
    {#if Object.keys(item.utilities).length > 0}
      <h2 class="mt-4 mb-6 mx-auto text-sm">{kebabToTitleCase(item.plugin)}</h2>
      <div class="w-full mx-auto">
        <div class="mt-0 border-t overflow-hidden relative">
          <div
            class="overflow-y-auto scrollbar-w-2 scrollbar-track-gray-lighter
              scrollbar-thumb-rounded scrollbar-thumb-gray scrolling-touch">
            <table class="w-full text-left table-collapse">
              <thead>
                <tr>
                  <th
                    class="z-20 sticky top-0 font-semibold text-gray-700
                      bg-gray-100 p-0">
                    <div class="p-2 border-b border-gray-300">Class</div>
                  </th>
                  <th
                    class="z-20 sticky top-0 font-semibold text-gray-700
                      bg-gray-100 p-0">
                    <div class="p-2 border-b border-gray-300">Properties</div>
                  </th>
                </tr>
              </thead>
              <tbody class="align-baseline">
                {#each Object.keys(item.utilities) as selector}
                  <tr class="border-b border-gray-300">
                    <td
                      class="p-2 font-mono text-xs text-purple-700
                        whitespace-no-wrap">
                      <label class="inline-flex items-center">
                        <input
                          type="checkbox"
                          on:change={(e) => handleChange(e, selector)}
                          bind:checked={selectedClasses[selector.substr(1)]} />
                        <span class="ml-2">{transformSelector(selector)}</span>
                      </label>
                    </td>
                    <td
                      class="p-2 font-mono text-xs text-blue-700 whitespace-pre">
                      {stringifyProperties(item.utilities[selector])}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    {/if}
  {/each}
</main>
