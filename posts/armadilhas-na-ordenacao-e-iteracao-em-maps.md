## Ordenação em maps no Go

Quando falamos de ordenação, é importante entender alguns comportamentos fundamentais da estrutura de dados `map` em Go:

- Um `map` **não mantém os dados ordenados por chave** (não é baseado em árvore binária).
- Um `map` **não preserva a ordem de inserção**. Ou seja, se inserirmos o par A antes do par B, não devemos assumir nada com base nisso.
- Ao iterar sobre um `map`, **não devemos fazer nenhuma suposição sobre a ordem dos elementos**.

### Exemplo

```go
m := map[string]int{
	"I": 1,
	"II": 2,
	"III": 3,
	"IV": 4,
	"V": 5,
	"VI": 6,
}

for k := range m {
	fmt.Printf("%s, ", k)
}
```

Podemos esperar que as chaves sejam impressas na ordem em que estão “armazenadas internamente”, como `I, II, III, IV, V, VI`?  
Não, nem isso.

Em Go, **a ordem de iteração de um `map` não é especificada**. Além disso, não há garantia de que duas iterações consecutivas produzirão a mesma ordem. Por isso, é essencial não basear o código em suposições incorretas sobre ordenação.

> Embora a ordem não seja garantida, ela também não é completamente aleatória. Por isso, a especificação do Go usa o termo *não especificada* em vez de *randômica*. Existe uma lógica determinística por trás desse comportamento, baseada na organização dos dados em buckets e na aplicação de funções de hash sobre as chaves. Dentro de uma mesma execução, é possível observar padrões aparentemente consistentes, especialmente em maps pequenos, mas esses padrões são apenas um efeito colateral da implementação atual e podem mudar sem qualquer aviso, seja entre execuções diferentes ou até entre versões da linguagem. Em outras palavras, embora o comportamento não seja *randômico* no sentido estrito, ele também não é confiável.

### Atenção com bibliotecas

Como desenvolvedores Go, não devemos assumir qualquer ordenação ao iterar sobre um `map`. No entanto, algumas bibliotecas podem introduzir comportamentos diferentes.

Por exemplo, o pacote padrão `encoding/json` ordena as chaves alfabeticamente ao serializar um `map` para JSON, independentemente da ordem de inserção. Mas isso **não é uma propriedade do `map`**, e sim da biblioteca.

---

## Modificando maps durante a iteração

Outro ponto importante é o que acontece ao adicionar elementos em um `map` enquanto iteramos sobre ele.

Considere o exemplo:

```go
m := map[int]bool{
	0: true,
	1: false,
	2: true,
}

for k, v := range m {
	if v {
		m[10+k] = true
	}
}

fmt.Println(m)
// map[0:true 1:false 2:true 10:true 12:true 20:true 22:true 30:true 32:true]
// map[0:true 1:false 2:true 10:true 12:true]
// map[0:true 1:false 2:true 10:true 12:true 20:true]
```

O resultado desse código é **imprevisível**.

De acordo com a especificação do Go:

> Se uma entrada for criada durante a iteração, ela pode ou não ser visitada na mesma iteração. Essa decisão pode variar entre execuções e entre diferentes entradas.

#### O que isso significa?

O `for range` em um `map` não trabalha com uma “lista fixa” de elementos. Ele vai lendo o `map` enquanto ele existe.

Agora imagine isso: você começa a percorrer o `map` e, no meio do caminho, adiciona um novo elemento no mesmo `map`.

A dúvida é: esse novo elemento entra no loop atual ou não?

A resposta do Go é: *talvez sim, talvez não*.

Isso acontece porque o iterador não garante que já “fixou” todos os elementos que serão percorridos desde o início. Dependendo do estado interno do `map`, o novo valor pode acabar sendo visitado ainda nessa iteração ou simplesmente não ser visitado naquele loop.

Na prática, isso leva a um comportamento inconsistente. Em algumas execuções o elemento aparece durante o `range`, em outras ele só aparece depois, e em alguns casos pode nem aparecer naquela iteração.

O ponto principal é que não existe garantia sobre isso. Por isso o comportamento é chamado de não determinístico: você não consegue prever com segurança o resultado quando modifica o `map` enquanto ele está sendo iterado.

A regra prática mais importante é simples: não adicione nem remova elementos de um `map` enquanto estiver iterando sobre ele com `for range`.

### Como evitar esse problema

Se você precisa atualizar um `map` enquanto itera sobre ele e quer resultados previsíveis, uma abordagem segura é trabalhar com uma cópia:

```go
func copyMap(src map[int]bool) map[int]bool {
	dst := make(map[int]bool, len(src))
	for k, v := range src {
		dst[k] = v
	}

	return dst
}

m := map[int]bool{
	0: true,
	1: false,
	2: true,
}

m2 := copyMap(m)

for k, v := range m {
	if v {
		m2[10+k] = true
	}
}

fmt.Println(m2)
// map[0:true 1:false 2:true 10:true 12:true]
```

Nesse caso, separamos claramente o `map` que estamos lendo (`m`) do `map` que estamos modificando (`m2`).

O resultado passa a ser previsível.

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.