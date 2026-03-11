O `map` no Go é essencialmente um **ponteiro para uma estrutura interna do runtime** chamada `runtime.hmap`.  
Essa estrutura contém todas as informações necessárias para **gerenciar o armazenamento e a busca das chaves**.

A definição pode ser encontrada no [repositório oficial do Go](https://github.com/golang/go/blob/846dce9d05f19a1f53465e62a304dea21b99f910/src/runtime/map.go#L115).

---

# Estrutura interna do map

```go
// A header for a Go map.
type hmap struct {
	count     int // # live cells == size of map. Must be first (used by len() builtin)
	flags     uint8
	B         uint8  // log2 do número de buckets
	noverflow uint16 // número aproximado de buckets de overflow
	hash0     uint32 // seed do hash

	buckets    unsafe.Pointer // array de 2^B buckets
	oldbuckets unsafe.Pointer // usado durante o processo de crescimento
	nevacuate  uintptr        // progresso da realocação de buckets

	extra *mapextra // campos opcionais
}
```

Entre os campos dessa estrutura, **um dos mais importantes é o campo `B`**, responsável por definir **quantos buckets existem no map**.

---

# O papel do campo B

O campo `B` representa **log₂ do número de buckets utilizados pelo map**.

Em vez de armazenar diretamente a quantidade de buckets, o runtime guarda apenas esse valor logarítmico porque **o número de buckets sempre é uma potência de 2**.

### Exemplo

| B | Número de buckets |
|---|---|
| 0 | 1 |
| 1 | 2 |
| 2 | 4 |
| 3 | 8 |
| 4 | 16 |

### Por que isso foi feito?

Essa decisão de design permite que o runtime determine rapidamente **em qual bucket um elemento deve ser armazenado** usando **operações de bit**.

Operações de bit são **significativamente mais rápidas** que divisões e operações de módulo (`%`).

---

# Onde surge o problema de memória

Um detalhe importante da implementação de maps em Go é:

**Maps podem crescer, mas nunca encolher.**

Quando elementos são removidos de um map:

- os **slots correspondentes são apenas zerados**
- os **buckets continuam alocados**

Ou seja:

- remover elementos **não reduz a quantidade de buckets**
- o runtime **não possui mecanismo para reduzir essa estrutura**

Isso significa que o map pode **crescer conforme necessário**, mas **não libera memória automaticamente quando diminui**.

Em alguns cenários, isso pode causar **consumo de memória maior do que o esperado**.

---

# Experimento prático

Vamos observar esse comportamento com um pequeno experimento.

No exemplo abaixo:

1. Inserimos **10 milhões de elementos**
2. Removemos todos
3. Inserimos novamente os mesmos **10 milhões**
4. Medimos o tempo da segunda inserção

```go
func measureInsert(n int, m map[int]int) time.Duration {
    start := time.Now()
    for i := 0; i < n; i++ {
        m[i] = i
    }
    return time.Since(start)
}

func main() {
    n := 10_000_000
    m := make(map[int]int)

    // Inserção inicial
    dur1 := measureInsert(n, m)
    fmt.Println("Tempo de inserção inicial:", dur1)

    // Deletando todos os elementos
    for i := 0; i < n; i++ {
        delete(m, i)
    }
    fmt.Println("Map vazio, len =", len(m))

    // Inserção novamente
    dur2 := measureInsert(n, m)
    fmt.Println("Tempo de inserção após deletar:", dur2)
}
```

### Saída obtida

```
Tempo de inserção inicial: 1.3714822s
Map vazio, len = 0
Tempo de inserção após deletar: 990.7482ms
```

### O que aconteceu?

Mesmo com o **map vazio (`len = 0`)**, a segunda inserção é **quase 30% mais rápida**.

Isso acontece porque:

- os **buckets alocados na primeira execução não foram liberados**
- o runtime **reutiliza a estrutura interna existente**
- novas **alocações de memória são evitadas**

---

# Quando isso realmente se torna um problema

Em muitos casos, o fato de um map **não encolher** não causa impacto real.

Porém, imagine um cenário de **Black Friday**.

Durante o pico:

- o sistema recebe **milhões de clientes simultaneamente**
- o map **cresce para acomodar essa carga**

Depois do pico:

- o número de clientes **cai drasticamente**
- o map **continua mantendo a mesma quantidade de buckets**

### Resultado

O serviço passa a consumir **muito mais memória do que realmente precisa**, mesmo com poucos dados armazenados.

---

# Possível solução

Se não quisermos simplesmente **reiniciar o serviço para liberar memória**, uma abordagem comum é **recriar o map periodicamente**.

A ideia é:

1. Criar um novo map
2. Copiar os elementos do map atual
3. Substituir o antigo pelo novo

Exemplo conceitual:

```go
newMap := make(map[int][128]byte, len(oldMap))

for k, v := range oldMap {
    newMap[k] = v
}

oldMap = newMap
```

Uma estratégia comum é executar esse processo **periodicamente (por exemplo, a cada hora)**.

---

# Desvantagem dessa abordagem

Durante o processo de cópia, e até a próxima execução do **garbage collector**, o programa pode **temporariamente consumir quase o dobro da memória**, pois o **map antigo** e o **map novo** coexistem por um curto período.

---

# Conclusão

Apesar dessa limitação, em **sistemas de longa duração com cargas muito variáveis**, essa técnica pode ser **essencial para evitar crescimento descontrolado de memória**.