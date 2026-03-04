No Go, um **map** é implementado com base na estrutura de dados conhecida como **hash table**.

Uma hash table permite armazenar e recuperar valores de forma eficiente a partir de uma chave. Em vez de percorrer todos os elementos, utilizamos uma **função de hash**, que transforma a chave em um índice de um array. Uma função hash recebe um dado de entrada (como string, número ou struct) e produz um valor numérico fixo que representa esse dado.

Essa função de hash precisa ser determinística: dada a mesma chave, sempre retorna o mesmo índice, garantindo que o map saiba exatamente onde procurar o valor.

Internamente, as hash tables são compostas por um array de **buckets**, sendo cada bucket a unidade de armazenamento. Cada bucket funciona como um pequeno agrupamento de pares chave-valor. Ou seja, em vez de cada posição do array principal guardar apenas um único elemento, ela aponta para um bucket onde os dados realmente ficam armazenados.

Nos maps do Go, cada bucket suporta até oito pares chave-valor. Quando duas ou mais chaves diferentes geram o mesmo índice (colisão), elas podem coexistir dentro do mesmo bucket. Quando um bucket atinge sua capacidade máxima, o **runtime** cria um novo bucket encadeado ao anterior, processo chamado **overflow de bucket**. Mesmo com muitas colisões, a busca continua eficiente, exigindo apenas uma pequena varredura sequencial no bucket.

Um map começa com apenas **um bucket**. À medida que elementos são adicionados e o fator de carga aumenta, o map cresce: o número de buckets é **dobrado**. Todas as chaves existentes são redistribuídas (**rehash**) entre os novos buckets, já que o índice depende da quantidade total de buckets. Esse crescimento tem custo computacional adicional.

[Como visto com **slices**](./como-nao-inicializar-slices.html), se sabemos de antemão quantos elementos serão adicionados, podemos inicializá-las com um tamanho ou capacidade específica, evitando realocações custosas. O mesmo vale para **maps**: podemos usar `make` para fornecer um **tamanho inicial**:

```go
m := make(map[string]int, 1_000_000)
```

Com maps, `make` aceita apenas o tamanho inicial, diferente dos **slices** que podem ter capacidade separada. Isso fornece uma estimativa do número de elementos esperados, permitindo que o **runtime** aloque buckets suficientes desde o início, evitando redistribuição de chaves e economizando processamento.

Essa diferença de performance é visível no seguinte **benchmark**:

```go
const size = 1_000_000

// Benchmark sem capacidade inicial
func BenchmarkMapWithoutSize(b *testing.B) {
    for i := 0; i < b.N; i++ {
        m := make(map[string]int)
        for j := 0; j < size; j++ {
            m[strconv.Itoa(j)] = j
        }
    }
}

// Benchmark com capacidade inicial
func BenchmarkMapWithSize(b *testing.B) {
    for i := 0; i < b.N; i++ {
        m := make(map[string]int, size)
        for j := 0; j < size; j++ {
            m[strconv.Itoa(j)] = j
        }
    }
}
```

Resultados:

```
BenchmarkMapWithoutSize-8    6    195760433 ns/op
BenchmarkMapWithSize-8       9    119610011 ns/op
```

O `BenchmarkMapWithoutSize` levou em média 195ms por execução, enquanto o `BenchmarkMapWithSize` levou cerca de 119ms, mostrando que o map com capacidade pré-definida é aproximadamente **60% mais rápido**.

Em resumo: sempre que for possível estimar a quantidade de elementos de um map, informe esse tamanho na criação. É uma otimização simples, idiomática e com impacto real de performance.

**Referência**:  
HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.