<!DOCTYPE html>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Laporan Jurnal Mengajar</title>
    <style>
        @page {
            margin: 20px;
        }

        body {
            font-family: sans-serif;
            font-size: 11px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .header h1 {
            margin: 0;
            font-size: 16px;
            text-transform: uppercase;
        }

        .header p {
            margin: 2px 0;
            font-size: 12px;
        }

        .meta-info {
            width: 100%;
            margin-bottom: 15px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }

        .meta-info td {
            vertical-align: top;
        }

        table.data {
            width: 100%;
            border-collapse: collapse;
        }

        table.data th,
        table.data td {
            border: 1px solid #000;
            padding: 5px;
            vertical-align: top;
        }

        table.data th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
        }

        .footer {
            margin-top: 30px;
            width: 100%;
        }

        .footer-sign {
            float: right;
            width: 200px;
            text-align: center;
        }

        .footer-sign p {
            margin: 2px 0;
        }

        .space-signature {
            height: 60px;
        }

        .img-proof {
            width: 100%;
            max-width: 150px;
            height: auto;
            margin: 5px auto;
            display: block;
            border: 1px solid #ddd;
        }
    </style>
</head>

<body>

    <div class="header">
        <h1>LAPORAN JURNAL MENGAJAR {{$periode?->nama}} {{$semester?->nama}}</h1>
        <h1>{{ strtoupper($user->departemen?->nama ?? '-') }}</h1>
        <p>{{ strtoupper($user->name) }} - {{ strtoupper($monthName) }} {{ $year }}</p>
    </div>

    <table class="data">
        <thead>
            <tr>
                <th width="30">No</th>
                <th width="80">Hari/Tanggal</th>
                <th width="70">Jam</th>
                <th width="100">Kelas/Mapel</th>
                <th>Materi</th>
                <th>Catatan & Refleksi</th>
                <th width="160">Dokumentasi</th>
            </tr>
        </thead>
        @php
            $no = 1;
            $groupedJurnals = $jurnals->groupBy(function ($item) {
                return \Carbon\Carbon::parse($item->tanggal)->format('Y-m-d');
            });
        @endphp

        @forelse($groupedJurnals as $date => $dailyJurnals)
            <tbody style="page-break-inside: avoid;">
                @foreach($dailyJurnals as $index => $jurnal)
                    <tr>
                        <td style="text-align: center;">{{ $no++ }}</td>

                        @php
                            $isFirst = $index === 0;
                        @endphp

                        <td style="vertical-align: middle;">
                            @if($isFirst)
                                {{ \Carbon\Carbon::parse($date)->locale('id')->translatedFormat('l, d F Y') }}
                            @endif
                        </td>

                        <td style="text-align: center;">{{ \Carbon\Carbon::parse($jurnal->jam_mulai)->format('H:i') }} -
                            {{ \Carbon\Carbon::parse($jurnal->jam_selesai)->format('H:i') }}
                        </td>
                        <td>
                            <strong>{{ $jurnal->kelas?->nama ?? '-' }}</strong><br>
                            {{ $jurnal->mata_pelajaran?->nama ?? '-' }}
                        </td>
                        <td>{{ $jurnal->materi }}</td>
                        <td>{{ $jurnal->catatan ?? '-' }}</td>
                        <td style="text-align: center; vertical-align: middle;">
                            @if($jurnal->foto && count($jurnal->foto) > 0)
                                @foreach($jurnal->foto as $foto)
                                    <img src="{{ public_path('storage/' . $foto) }}" class="img-proof">
                                @endforeach
                            @else
                                -
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        @empty
            <tbody>
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px;">Tidak ada data jurnal.</td>
                </tr>
            </tbody>
        @endforelse
    </table>

    <div class="footer">
        <div class="footer-sign">
            <div class="space-signature"></div>
            <p style="font-weight: bold; text-decoration: underline;">{{ $user->name }}</p>
            <p>NIG: {{ $guru->nig ?? '-' }}</p>
        </div>
    </div>

</body>

</html>