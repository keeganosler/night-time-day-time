import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Map, View } from 'ol';
import DayNight from 'ol-ext/source/DayNight';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import { XYZ } from 'ol/source';
import Fill from 'ol/style/Fill';
import Style from 'ol/style/Style';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {
  map: Map | undefined;
  @ViewChild('map') mapRef: ElementRef | undefined;
  baselayer: TileLayer<XYZ> = new TileLayer({
    source: new XYZ({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    }),
  });

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.map = new Map({
      target: this.mapRef?.nativeElement,
      layers: [this.baselayer],
      view: new View({
        center: fromLonLat([-101.320426, 42.041532]),
        zoom: 4,
      }),
    });

    this.map.addLayer(
      new VectorLayer({
        source: new DayNight({}),
        style: new Style({
          fill: new Fill({
            color: [0, 0, 50, 0.5],
          }),
        }),
      })
    );
  }
}
