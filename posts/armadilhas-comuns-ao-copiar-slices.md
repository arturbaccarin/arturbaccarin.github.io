A função padrão `copy` do Go é utilizada para copiar elementos de um slice para outro.

Apesar de simples, alguns erros comuns podem acontecer durante o seu uso.

### Atenção ao tamanho do slice de destino

O primeiro ponto importante está relacionado ao tamanho do slice de destino.

Para que a cópia funcione corretamente, o slice de destino **precisa ter comprimento (`len`) maior ou igual ao número de elementos que serão copiados**.

Veja o exemplo abaixo:

```go
foo := []int{1, 2, 3}
bar := make([]int, 0)

copy(bar, foo)
fmt.Println(bar) // Output: []
```

Mesmo chamando `copy`, o slice `bar` continua vazio. Isso acontece porque ele tem comprimento zero — não há espaço para receber os elementos.

O ideal é criar o slice de destino com o mesmo tamanho do slice de origem:

```go
foo := []int{1, 2, 3}
bar := make([]int, len(foo))

copy(bar, foo)
fmt.Println(bar) // Output: [1 2 3]
```

### Ordem correta dos parâmetros

Outro erro comum é inverter a ordem dos parâmetros. A assinatura correta da função é:

```go
copy(destino, origem)
```

### Usando `append` para copiar slices

O `copy` não é a única forma de copiar slices. O `append` também pode ser usado:

```go
foo := []int{1, 2, 3}
bar := append([]int(nil), foo...)

fmt.Println(bar) // Output: [1 2 3]
```

Apesar disso, o uso de `copy` costuma ser mais idiomático, pois deixa mais clara a intenção de copiar dados.

Além disso, o `append` pode introduzir comportamentos inesperados se não for usado com cuidado.

### Um comportamento inesperado com `append`

Analise o exemplo abaixo:

```go
s1 := []int{1, 2, 3}
s2 := s1[1:2]
s3 := append(s2, 10)

fmt.Println(s1) // Output: [1 2 10]
fmt.Println(s2) // Output: [2]
fmt.Println(s3) // Output: [2 10]
```

Mesmo sem modificar `s1` diretamente, seu conteúdo é alterado.

Isso acontece porque slices em Go compartilham o mesmo **array subjacente**.

Quando criamos `s2 := s1[1:2]`, o slice `s2` aponta para a mesma área de memória de `s1`, apenas com um deslocamento e um tamanho diferente.

Como `s2` ainda possui capacidade suficiente para crescer dentro do array original de `s1`, o `append(s2, 10)` reutiliza esse array, sobrescrevendo o valor na posição seguinte — que corresponde ao índice `2` de `s1`.

O resultado é:

- `s3` aponta para o mesmo array, agora com os valores `[2, 10]`
- `s1` é modificado para `[1, 2, 10]`

### Como evitar esse tipo de efeito colateral

Existem duas abordagens principais.

#### 1. Criar uma cópia explícita com `copy`

```go
s1 := []int{1, 2, 3}

s2 := make([]int, 2)
copy(s2, s1[:2])

s3 := append(s2, 10)
```

Essa abordagem é segura, mas tem dois pontos negativos:

- deixa o código um pouco mais verboso
- adiciona uma cópia extra, o que pode ser relevante para slices grandes

#### 2. Usar a *full slice expression*

```go
s1 := []int{1, 2, 3}

s2 := s1[:2:2]
s3 := append(s2, 10)
```

A expressão `s[low:high:max]` define não apenas o comprimento, mas também a **capacidade** do slice.

Ao limitar a capacidade de `s2` para `2`, garantimos que qualquer `append` obrigatoriamente aloque um novo array, evitando efeitos colaterais no slice original — e sem a necessidade de realizar uma cópia manual.

Ao trabalhar com slices em Go, é fundamental lembrar que eles compartilham memória. Se um slice resultante tiver comprimento menor que sua capacidade, chamadas a `append` podem modificar dados inesperadamente.

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.