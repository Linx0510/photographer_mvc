/**
 * Многослойный перцептрон (MLP) — реализация с нуля
 *
 * Архитектура: Input → Hidden1(ReLU) → Hidden2(ReLU) → Output(Softmax)
 * Оптимизатор: SGD с импульсом (Momentum SGD)
 * Функция потерь: кросс-энтропия (Cross-Entropy)
 * Инициализация: He (оптимальна для ReLU)
 */

class NeuralNetwork {
  /**
   * @param {number} inputSize  — размер входного вектора (словарь)
   * @param {number} hidden1    — нейронов в 1-м скрытом слое
   * @param {number} hidden2    — нейронов в 2-м скрытом слое
   * @param {number} outputSize — число классов (намерений)
   * @param {number} lr         — начальная скорость обучения
   * @param {number} momentum   — коэффициент импульса (0.9 по умолчанию)
   */
  constructor(inputSize, hidden1, hidden2, outputSize, lr = 0.01, momentum = 0.9) {
    this.lr = lr;
    this.momentum = momentum;

    // Инициализация весов методом He (лучшая для ReLU)
    this.W1 = this._heInit(inputSize, hidden1);
    this.b1 = this._zeros(hidden1);

    this.W2 = this._heInit(hidden1, hidden2);
    this.b2 = this._zeros(hidden2);

    this.W3 = this._heInit(hidden2, outputSize);
    this.b3 = this._zeros(outputSize);

    // Буферы скорости (для momentum)
    this.vW1 = this._zeroMatrix(inputSize, hidden1);
    this.vb1 = this._zeros(hidden1);
    this.vW2 = this._zeroMatrix(hidden1, hidden2);
    this.vb2 = this._zeros(hidden2);
    this.vW3 = this._zeroMatrix(hidden2, outputSize);
    this.vb3 = this._zeros(outputSize);
  }

  // ---------- Инициализация весов ----------

  /** He initialization: scale = sqrt(2 / fan_in) */
  _heInit(fan_in, fan_out) {
    const scale = Math.sqrt(2.0 / fan_in);
    return Array.from({ length: fan_in }, () =>
      Array.from({ length: fan_out }, () => (Math.random() * 2 - 1) * scale)
    );
  }

  _zeros(size) {
    return new Array(size).fill(0);
  }

  _zeroMatrix(rows, cols) {
    return Array.from({ length: rows }, () => new Array(cols).fill(0));
  }

  // ---------- Функции активации ----------

  /** ReLU: max(0, x) */
  _relu(x) {
    return Math.max(0, x);
  }

  /** Производная ReLU: 1 если a > 0, иначе 0 */
  _reluDeriv(a) {
    return a > 0 ? 1 : 0;
  }

  /** Softmax для выходного слоя */
  _softmax(arr) {
    const max = Math.max(...arr);
    const exp = arr.map(x => Math.exp(Math.max(-500, Math.min(500, x - max))));
    const sum = exp.reduce((a, b) => a + b, 1e-12);
    return exp.map(x => x / sum);
  }

  // ---------- Умножение вектора на матрицу ----------
  // W: [fan_in × fan_out], x: [fan_in] → out: [fan_out]
  _matVecMul(W, x) {
    const cols = W[0].length;
    const rows = W.length;
    const out = new Array(cols).fill(0);
    for (let j = 0; j < cols; j++) {
      let sum = 0;
      for (let i = 0; i < rows; i++) {
        sum += W[i][j] * x[i];
      }
      out[j] = sum;
    }
    return out;
  }

  // ---------- Прямой проход (Forward Pass) ----------
  _forward(x) {
    // Слой 1: z1 = W1^T * x + b1,  a1 = ReLU(z1)
    const z1 = this._matVecMul(this.W1, x).map((v, i) => v + this.b1[i]);
    const a1 = z1.map(v => this._relu(v));

    // Слой 2: z2 = W2^T * a1 + b2,  a2 = ReLU(z2)
    const z2 = this._matVecMul(this.W2, a1).map((v, i) => v + this.b2[i]);
    const a2 = z2.map(v => this._relu(v));

    // Выходной слой: z3 = W3^T * a2 + b3,  a3 = Softmax(z3)
    const z3 = this._matVecMul(this.W3, a2).map((v, i) => v + this.b3[i]);
    const a3 = this._softmax(z3);

    return { a1, a2, a3 };
  }

  // ---------- Обратное распространение ошибки (Backpropagation + Momentum SGD) ----------
  _backward(x, y, cache) {
    const { a1, a2, a3 } = cache;
    const lr = this.lr;
    const mu = this.momentum;

    // === Градиент выходного слоя (Softmax + Cross-Entropy) ===
    // ∂L/∂z3 = a3 - y  (аналитический градиент)
    const dz3 = a3.map((v, i) => v - y[i]);

    // Обновление W3, b3 с momentum
    for (let i = 0; i < this.W3.length; i++) {
      for (let j = 0; j < this.W3[0].length; j++) {
        const grad = dz3[j] * a2[i];
        this.vW3[i][j] = mu * this.vW3[i][j] + lr * grad;
        this.W3[i][j] -= this.vW3[i][j];
      }
    }
    for (let j = 0; j < this.b3.length; j++) {
      this.vb3[j] = mu * this.vb3[j] + lr * dz3[j];
      this.b3[j] -= this.vb3[j];
    }

    // === Градиент скрытого слоя 2 ===
    const da2 = new Array(a2.length).fill(0);
    for (let i = 0; i < a2.length; i++) {
      for (let j = 0; j < dz3.length; j++) {
        da2[i] += dz3[j] * this.W3[i][j];
      }
    }
    const dz2 = da2.map((v, i) => v * this._reluDeriv(a2[i]));

    // Обновление W2, b2 с momentum
    for (let i = 0; i < this.W2.length; i++) {
      for (let j = 0; j < this.W2[0].length; j++) {
        const grad = dz2[j] * a1[i];
        this.vW2[i][j] = mu * this.vW2[i][j] + lr * grad;
        this.W2[i][j] -= this.vW2[i][j];
      }
    }
    for (let j = 0; j < this.b2.length; j++) {
      this.vb2[j] = mu * this.vb2[j] + lr * dz2[j];
      this.b2[j] -= this.vb2[j];
    }

    // === Градиент скрытого слоя 1 ===
    const da1 = new Array(a1.length).fill(0);
    for (let i = 0; i < a1.length; i++) {
      for (let j = 0; j < dz2.length; j++) {
        da1[i] += dz2[j] * this.W2[i][j];
      }
    }
    const dz1 = da1.map((v, i) => v * this._reluDeriv(a1[i]));

    // Обновление W1, b1 с momentum
    for (let i = 0; i < this.W1.length; i++) {
      for (let j = 0; j < this.W1[0].length; j++) {
        const grad = dz1[j] * x[i];
        this.vW1[i][j] = mu * this.vW1[i][j] + lr * grad;
        this.W1[i][j] -= this.vW1[i][j];
      }
    }
    for (let j = 0; j < this.b1.length; j++) {
      this.vb1[j] = mu * this.vb1[j] + lr * dz1[j];
      this.b1[j] -= this.vb1[j];
    }
  }

  /**
   * Обучение нейросети
   * @param {Array} data   — [{input: number[], output: number[]}, ...]
   * @param {number} epochs — количество эпох
   */
  train(data, epochs = 2000) {
    let bestLoss = Infinity;

    for (let epoch = 0; epoch < epochs; epoch++) {
      // Перемешивание данных (стохастический GD)
      const shuffled = [...data].sort(() => Math.random() - 0.5);

      let totalLoss = 0;
      for (const sample of shuffled) {
        const cache = this._forward(sample.input);

        // Кросс-энтропийная потеря: L = -sum(y * log(a3 + ε))
        const loss = -sample.output.reduce(
          (acc, y, i) => acc + y * Math.log(cache.a3[i] + 1e-12), 0
        );
        totalLoss += loss;
        this._backward(sample.input, sample.output, cache);
      }

      const avgLoss = totalLoss / data.length;
      if (avgLoss < bestLoss) bestLoss = avgLoss;

      if ((epoch + 1) % 500 === 0) {
        const acc = this._accuracy(data);
        console.log(`Эпоха ${epoch + 1}/${epochs} — Loss: ${avgLoss.toFixed(4)} — Точность: ${(acc * 100).toFixed(1)}%`);
      }
    }
    console.log(`Лучшая потеря: ${bestLoss.toFixed(4)}`);
  }

  /** Вычислить точность на обучающем наборе */
  _accuracy(data) {
    let correct = 0;
    for (const sample of data) {
      const { a3 } = this._forward(sample.input);
      const pred = a3.indexOf(Math.max(...a3));
      const truth = sample.output.indexOf(Math.max(...sample.output));
      if (pred === truth) correct++;
    }
    return correct / data.length;
  }

  /**
   * Предсказание класса
   * @param {number[]} x      — входной вектор
   * @param {string[]} labels — названия классов
   * @returns {{ label: string, confidence: number, probabilities: object }}
   */
  predict(x, labels) {
    const { a3 } = this._forward(x);
    const maxIdx = a3.indexOf(Math.max(...a3));
    const probabilities = {};
    labels.forEach((label, i) => { probabilities[label] = +(a3[i].toFixed(4)); });
    return {
      label: labels[maxIdx],
      confidence: a3[maxIdx],
      probabilities
    };
  }
}

module.exports = { NeuralNetwork };
