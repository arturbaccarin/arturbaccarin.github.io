Um **pacote utilitário** é aquele que reúne funções, tipos e estruturas “genéricas” ou “de uso comum”. São recursos que, em teoria, podem ser aproveitados por diferentes partes de um projeto.

Exemplo de funções típicas:

```go
func Contains(slice []string, s string) bool
func Min(a, b int) int
func Max(a, b int) int
```

> **Mas surge a pergunta: como dar nome a esses pacotes de forma significativa?**

Nomes como `utils`, `common`, `shared` ou `base` não são boas práticas. Eles carregam pouco significado e não oferecem nenhum *insight* sobre o que o pacote realmente provê.

Em vez de criar um grande pacote utilitário, a recomendação é **dividir em pacotes menores, com nomes expressivos e coesos**.

💡 **Dica:** nomeie o pacote pelo que ele **fornece**, e não apenas pelo que ele **contém**. Isso aumenta a clareza e a expressividade do código.

No exemplo abaixo, o pacote `utils` concentra funções sem relação direta entre si. O problema é que, ao crescer, esse pacote se torna difícil de manter e confuso de usar.

**Estrutura inicial**

```text
myapp/
├── main.go
└── utils/
    └── utils.go
```

```go
package utils

func Contains(slice []int, value int) bool {
    for _, v := range slice {
        if v == value {
            return true
        }
    }
    return false
}

type StringSet map[string]struct{}

func NewStringSet() StringSet {
    return make(StringSet)
}

func (s StringSet) Add(item string) {
    s[item] = struct{}{}
}

func (s StringSet) Has(item string) bool {
    _, exists := s[item]
    return exists
}
```

Uso no `main.go`.

```go
package main

import (
    "fmt"
    "myapp/utils"
)

func main() {
    nums := []int{1, 2, 3}
    fmt.Println(utils.Contains(nums, 2)) // true

    s := utils.NewStringSet()
    s.Add("go")
    fmt.Println(s.Has("go")) // true
}
```

**Estrutura reorganizada**

Ao dividir em pacotes menores e mais específicos, temos:

```text
myapp/
├── main.go
├── sliceutil/
│   └── contains.go
└── set/
    └── stringset.go
```

```go
package sliceutil

func ContainsInt(slice []int, value int) bool {
    for _, v := range slice {
        if v == value {
            return true
        }
    }
    return false
}

package stringset

func New(...string) map[string]struct{} { ... }
func Sort(map[string]struct{}) []string { ... }
```

Uso no `main.go`.

```go
package main

import (
    "fmt"
    "myapp/sliceutil"
    "myapp/set"
)

func main() {
    nums := []int{1, 2, 3}
    fmt.Println(sliceutil.ContainsInt(nums, 2))

    s := stringset.New()
    stringset.Sort(s)
}
```

### Benefícios da reorganização

- **Maior clareza**: a chamada das funções fica mais explícita.
- **Melhor leitura**: o código revela sua intenção de forma imediata.
- **Alta coesão**: cada pacote agrupa funções relacionadas, evitando o “pacote monstro” difícil de manter.

É verdade que os novos pacotes são pequenos, com poucos arquivos e funções. À primeira vista, isso pode parecer excesso de fragmentação. No entanto, se cada pacote tem alta coesão e seus objetos não pertencem a outro lugar específico, essa organização é não apenas aceitável, mas recomendada.

👉 Em resumo: **evite pacotes utilitários genéricos**. Prefira nomes expressivos e pacotes coesos. Essa prática melhora a manutenção, a legibilidade e a escalabilidade do seu projeto.

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.